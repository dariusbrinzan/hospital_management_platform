# Deployment and Infrastructure Config

Directorul `config/` centralizeaza setup-ul de build, orchestration si infrastructura pentru a rula aplicatia atat on-prem, cat si in cloud.

## Ce exista acum

- `config/docker/`
  - `Dockerfile`: build multi-stage pentru aplicatia Next.js 14
  - `docker-compose.postgresql.yml`: PostgreSQL local pentru dezvoltare sau validare de config
  - `docker-compose.redis.yml`: Redis local pentru testarea cache-ului
- `config/env/`
  - exemple de variabile de mediu pentru aplicatie si PostgreSQL
  - `redis.env.example` pentru configurarea Redis request cache
  - `observability.env.example` pentru configurarea Grafana/Prometheus/Fluent Bit
- `config/ansible/`
  - bootstrap pentru noduri Ubuntu si cluster Kubernetes self-managed cu `kubeadm`
- `config/k8s/`
  - manifests Kubernetes pentru aplicatie
  - overlay `sqlite` pentru rularea actuala
  - overlay `external-postgresql` pentru reutilizarea unei baze PostgreSQL existente
  - overlay `postgresql` care provisioneaza si PostgreSQL, fara sa migreze inca aplicatia
  - stack Redis separat pentru request caching in cluster
  - stack separat de observability cu Prometheus, Grafana, kube-state-metrics, node-exporter si Fluent Bit
- `config/jenkins/`
  - scripturi helper pentru pipeline-ul Jenkins
- `Jenkinsfile`
  - pipeline parametrizat pentru build, provisioning, configurare cluster si deploy
- `config/cloudformation/aws/`
  - template pentru cluster self-managed pe EC2
  - template pentru EKS
- `config/terraform/`
  - `aws-ec2`: infrastructura AWS pentru noduri EC2 + self-managed Kubernetes
  - `aws-eks`: infrastructura AWS pentru EKS
  - `azure-aks`: infrastructura Azure pentru AKS

## Observatie importanta despre baza de date

Aplicatia foloseste in acest moment `better-sqlite3` si scrie in `data/carepulse.db`. Din acest motiv:

- varianta operationala actuala pe Kubernetes ramane `1 replica`
- se monteaza un `PersistentVolumeClaim` la `/app/data`
- overlay-ul `postgresql` provisioneaza PostgreSQL pentru viitoarea migrare, dar aplicatia continua sa ruleze pe SQLite pana cand codul este adaptat
- autodiscovery-ul PostgreSQL este pregatit la nivel de container si pipeline, dar nu schimba inca logica aplicației

## Docker

Build local:

```bash
docker build \
  -f config/docker/Dockerfile \
  --build-arg NEXT_PUBLIC_APP_URL=https://carepulse.example.com \
  --build-arg NEXT_PUBLIC_ADMIN_PASSKEY=111111 \
  -t carepulse:latest .
```

Rulare locala:

```bash
docker run --rm -p 3000:3000 \
  --env-file config/env/app.env.example \
  -v $(pwd)/data:/app/data \
  carepulse:latest
```

PostgreSQL local separat:

```bash
docker compose -f config/docker/docker-compose.postgresql.yml up -d
```

Redis local separat:

```bash
docker compose -f config/docker/docker-compose.redis.yml up -d
```

Nota:

- variabilele `NEXT_PUBLIC_*` sunt importante la build time in Next.js
- imaginea nu mai include fisierul SQLite din repo; acesta trebuie livrat prin volum/PVC

## Kubernetes

Deployment pentru runtime-ul actual, bazat pe SQLite:

```bash
kubectl apply -k config/k8s/overlays/sqlite
```

Deployment cu PostgreSQL provisionat pentru migrarea viitoare:

```bash
kubectl apply -k config/k8s/overlays/postgresql
```

Deployment cu reutilizare de PostgreSQL extern:

```bash
kubectl apply -k config/k8s/overlays/external-postgresql
```

Ce face fiecare overlay:

- `sqlite`: aplicația + PVC pentru `data/carepulse.db`
- `external-postgresql`: aplicația + PVC SQLite + variabile pentru autodiscovery/reutilizare PostgreSQL extern
- `postgresql`: aplicația + PVC SQLite + StatefulSet PostgreSQL + Service + Secret + NetworkPolicy

## Redis request cache

Stack-ul Redis pentru cluster este in:

- `config/k8s/redis/base`

Ce include:

- `Deployment` Redis cu autentificare pe bază de parolă
- `Service` intern `redis`
- `PersistentVolumeClaim` pentru persistență
- `NetworkPolicy` care permite accesul doar din pod-urile aplicației

Deploy manual:

```bash
kubectl apply -k config/k8s/redis/base
```

Config pentru aplicație:

- `ENABLE_REQUEST_CACHE`
- `CACHE_PROVIDER=redis`
- `REQUEST_CACHE_DEFAULT_TTL_SECONDS`
- `REDIS_HOST`
- `REDIS_PORT`
- `REDIS_DB`
- `REDIS_KEY_PREFIX`
- `REDIS_PASSWORD`

În implementarea actuală, cache-ul Redis este conectat la endpoint-uri GET cu citire frecventă, cum ar fi:

- notificări pacient și medic
- căutare pacienți
- listă pacienți pentru admin
- catalog medicamente și stocuri
- camere ATI

Observație:

- cache-ul este `TTL-based`, nu are încă invalidare fină pe fiecare mutație
- din acest motiv am folosit TTL-uri scurte pentru date dinamice și TTL-uri mai lungi pentru cataloage relativ stabile

## Logging si monitorizare

Stack-ul de observability este in:

- `config/k8s/observability/base`

Ce include:

- `Prometheus` pentru colectarea metricalor de cluster si servicii annotate
- `Grafana` cu datasource Prometheus si dashboard preprovisionat
- `kube-state-metrics` pentru metrici despre obiectele Kubernetes
- `node-exporter` pentru metrici de nod
- `Fluent Bit` ca DaemonSet pentru colectarea logurilor din `var/log/containers`

Deploy manual:

```bash
kubectl apply -k config/k8s/observability/base
```

Inainte de deploy manual, ajusteaza dupa nevoie:

- host-ul din `config/k8s/observability/base/grafana.yaml`
- host-ul din `config/k8s/observability/base/prometheus.yaml`
- credențialele din `config/k8s/observability/base/grafana.yaml`

Observatii:

- `Fluent Bit` este configurat implicit sa colecteze si sa trimita logurile catre `stdout`, ca strat de colectare minim si portabil
- `Prometheus` scrape-uieste implicit `kube-state-metrics`, `node-exporter` si metricele interne ale `Fluent Bit`
- pentru servicii proprii, poti adauga annotation-ul `prometheus.io/scrape: "true"` pe `Service` atunci cand expui un endpoint `/metrics`
- pentru stocarea logurilor intr-un backend cautabil, poti extinde ulterior iesirea `Fluent Bit` catre Loki/OpenSearch/Elasticsearch fara sa schimbi structura pipeline-ului

Inainte de deploy aplicație:

1. Editeaza `config/k8s/base/secret.yaml`
2. Editeaza `config/k8s/base/configmap.yaml`
3. Actualizeaza `image:` in `config/k8s/base/deployment.yaml`
4. Ajusteaza host-ul din `config/k8s/base/ingress.yaml`

## Ansible pentru cluster self-managed

Structura din `config/ansible/` presupune noduri Ubuntu/Debian-like si un cluster bootstrap-uit cu `kubeadm`.

Playbook-uri:

```bash
cd config/ansible
ansible-playbook playbooks/bootstrap.yml
ansible-playbook playbooks/init-control-plane.yml
ansible-playbook playbooks/join-workers.yml
```

Ce configureaza:

- pachete de baza pentru noduri
- dezactivare swap
- `sysctl` si kernel modules pentru Kubernetes
- `containerd`
- `kubeadm`, `kubelet`, `kubectl`
- initializare control plane
- instalare CNI `flannel`
- join pentru workeri

Fisierul de inventar de start este:

- `config/ansible/inventories/onprem/hosts.ini`

Variabilele principale sunt in:

- `config/ansible/inventories/onprem/group_vars/all.yml`

## AWS CloudFormation

### Self-managed Kubernetes pe EC2

Template:

- `config/cloudformation/aws/ec2-self-managed-k8s.yaml`

Provisioneaza:

- VPC
- subnet public si doua subnet-uri private
- IGW, NAT Gateway, route tables
- bastion host
- 1 control plane node
- 2 worker nodes
- security groups si IAM instance profile

Exemplu:

```bash
aws cloudformation deploy \
  --template-file config/cloudformation/aws/ec2-self-managed-k8s.yaml \
  --stack-name carepulse-ec2-k8s \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides KeyName=my-key AdminCidr=1.2.3.4/32
```

### EKS

Template:

- `config/cloudformation/aws/eks-cluster.yaml`

Provisioneaza:

- VPC complet pentru EKS
- subnet-uri publice si private
- cluster EKS
- managed node group
- security groups
- IAM roles

Exemplu:

```bash
aws cloudformation deploy \
  --template-file config/cloudformation/aws/eks-cluster.yaml \
  --stack-name carepulse-eks \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides NodeKeyName=my-key AdminCidr=1.2.3.4/32
```

## Terraform

### AWS EC2 self-managed

```bash
cd config/terraform/aws-ec2
terraform init
terraform apply -var="key_name=my-key" -var="admin_cidr=1.2.3.4/32"
```

### AWS EKS

```bash
cd config/terraform/aws-eks
terraform init
terraform apply -var="admin_cidr=1.2.3.4/32" -var="key_name=my-key"
```

### Azure AKS

```bash
cd config/terraform/azure-aks
terraform init
terraform apply
```

## Jenkins CI/CD

Pipeline-ul este definit în [Jenkinsfile](/Users/brinzandarius/Desktop/Desktop/Disertatie/healthcare/Jenkinsfile) și folosește scripturile din [config/jenkins/scripts](/Users/brinzandarius/Desktop/Desktop/Disertatie/healthcare/config/jenkins/scripts).

Fluxul este:

1. build imagine Docker
2. provision infrastructură
3. pregătire acces cluster
4. configurare cluster self-managed sau obținere kubeconfig pentru EKS/AKS
5. deploy opțional Redis pentru request cache
6. autodiscovery PostgreSQL
7. deploy aplicație
8. deploy opțional stack de observability
9. verificări post-deploy pentru aplicație, Redis și observability

Parametrii noi pentru Redis în Jenkins:

- `DEPLOY_REDIS`
- `REDIS_PASSWORD`
- `REDIS_STORAGE_SIZE`
- `REQUEST_CACHE_DEFAULT_TTL_SECONDS`

Parametrii noi pentru observability în Jenkins:

- `DEPLOY_OBSERVABILITY`
- `OBSERVABILITY_NAMESPACE`
- `GRAFANA_INGRESS_HOST`
- `PROMETHEUS_INGRESS_HOST`
- `GRAFANA_ADMIN_USER`
- `GRAFANA_ADMIN_PASSWORD`

Pipeline-ul suportă:

- `aws-ec2` cu `terraform` sau `cloudformation`
- `aws-eks` cu `terraform` sau `cloudformation`
- `azure-aks` cu `terraform`
- `onprem` cu inventory existent

Parametrii principali:

- `TARGET_PLATFORM`
- `PROVISIONER`
- `DATABASE_MODE`
- `ENVIRONMENT`
- `APP_PUBLIC_URL`
- `APP_INGRESS_HOST`
- `IMAGE_REPOSITORY`
- `IMAGE_TAG`
- `APPLY_INFRA`
- `CONFIGURE_CLUSTER`
- `DEPLOY_APPLICATION`
- `AUTO_DISCOVER_POSTGRES`

Moduri pentru `DATABASE_MODE`:

- `sqlite`: deployment clasic cu SQLite
- `postgresql-auto`: caută o bază existentă și, dacă nu găsește, cade pe PostgreSQL embedded
- `postgresql-embedded`: deployează PostgreSQL din overlay-ul intern
- `postgresql-external`: cere o bază existentă; pipeline-ul eșuează dacă nu o găsește

Ce trebuie să existe pe agentul Jenkins:

- `docker`
- `terraform`
- `kubectl`
- `ansible` și `ansible-playbook`
- `jq`
- `python3`
- `aws` pentru AWS
- `az` pentru AKS

Pipeline-ul presupune că agentul Jenkins are deja autentificare funcțională către:

- registry-ul Docker folosit pentru push
- AWS și/sau Azure
- nodurile SSH pentru scenariile self-managed

Artefactele intermediare sunt scrise în:

- `config/jenkins/generated/<environment>/`

## Autodiscovery PostgreSQL

Am pregătit două niveluri de autodiscovery:

1. În pipeline:
   - caută `Secret` și `Service` PostgreSQL existente în cluster
   - poate reutiliza resurse existente dacă găsește credențiale și endpoint
2. În container:
   - entrypoint-ul încearcă să descopere host-uri PostgreSQL cunoscute prin DNS și `pg_isready`
   - dacă găsește un PostgreSQL accesibil, exportă `DATABASE_URL` și variabilele asociate

Fișiere implicate:

- [config/docker/entrypoint.sh](/Users/brinzandarius/Desktop/Desktop/Disertatie/healthcare/config/docker/entrypoint.sh)
- [config/docker/discover-postgresql.sh](/Users/brinzandarius/Desktop/Desktop/Disertatie/healthcare/config/docker/discover-postgresql.sh)
- [config/jenkins/scripts/discover-postgresql.sh](/Users/brinzandarius/Desktop/Desktop/Disertatie/healthcare/config/jenkins/scripts/discover-postgresql.sh)

Limitarea importantă rămâne aceeași:

- autodiscovery-ul pregătește conexiunea și face deployment-ul mai plug-and-play
- aplicația nu citește încă PostgreSQL la nivel de business logic, pentru că stratul de persistență nu a fost migrat din SQLite

## Ce ar presupune migrarea reala la PostgreSQL

Nu am facut migrarea in cod, doar am pregatit infrastructura/config-ul. Migrarea efectiva ar presupune:

1. Inlocuirea stratului `better-sqlite3` din [lib/db.ts](/Users/brinzandarius/Desktop/Desktop/Disertatie/healthcare/lib/db.ts) si [lib/db-helpers.ts](/Users/brinzandarius/Desktop/Desktop/Disertatie/healthcare/lib/db-helpers.ts) cu un client PostgreSQL sau ORM.
2. Portarea schemei SQLite catre DDL PostgreSQL:
   - tipuri de date
   - indecsi
   - constrangeri
   - autoincrement / UUID / default-uri
3. Rescrierea query-urilor care se bazeaza pe sintaxa sau functii SQLite.
4. Introducerea unui sistem de migrari versionate pentru baza de date.
5. Mutarea datelor existente din `carepulse.db` in PostgreSQL.
6. Schimbarea configurarii aplicatiei astfel incat runtime-ul sa foloseasca `DATABASE_URL`.
7. Dupa migrare, eliminarea dependentei pe PVC-ul SQLite si deschiderea drumului pentru mai multe replici ale aplicatiei.

## Recomandare practica

Pentru starea curenta a proiectului:

- daca vrei sa il rulezi repede si sigur pe Kubernetes, foloseste overlay-ul `sqlite`
- daca vrei sa pregatesti mediul pentru evolutie, foloseste overlay-ul `postgresql`, dar considera PostgreSQL doar provisionat, nu utilizat inca de aplicatie
- daca vrei scalare reala si `HA`, urmatorul pas corect este migrarea stratului de persistenta la PostgreSQL
