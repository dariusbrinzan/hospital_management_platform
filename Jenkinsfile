pipeline {
  agent any

  options {
    ansiColor('xterm')
    disableConcurrentBuilds()
    timestamps()
  }

  parameters {
    choice(name: 'TARGET_PLATFORM', choices: ['aws-ec2', 'aws-eks', 'azure-aks', 'onprem'], description: 'Unde va rula aplicația.')
    choice(name: 'PROVISIONER', choices: ['terraform', 'cloudformation', 'none'], description: 'Provisioner pentru infrastructură. CloudFormation este disponibil doar pentru AWS.')
    choice(name: 'DATABASE_MODE', choices: ['sqlite', 'postgresql-auto', 'postgresql-embedded', 'postgresql-external'], description: 'Strategia de bază de date pentru deployment.')
    string(name: 'ENVIRONMENT', defaultValue: 'dev', description: 'Numele mediului logic folosit în artefacte și state.')
    string(name: 'NAMESPACE', defaultValue: 'carepulse', description: 'Namespace Kubernetes pentru aplicație.')
    string(name: 'APP_PUBLIC_URL', defaultValue: 'https://carepulse.example.com', description: 'URL-ul public al aplicației.')
    string(name: 'APP_INGRESS_HOST', defaultValue: 'carepulse.example.com', description: 'Host-ul de ingress pentru aplicație.')
    string(name: 'IMAGE_REPOSITORY', defaultValue: 'ghcr.io/example/carepulse', description: 'Repository-ul imaginii Docker.')
    string(name: 'IMAGE_TAG', defaultValue: '', description: 'Tag-ul imaginii. Dacă e gol, se folosește build number + commit.')
    string(name: 'AWS_REGION', defaultValue: 'eu-central-1', description: 'Regiunea AWS pentru EC2/EKS.')
    string(name: 'AZURE_LOCATION', defaultValue: 'westeurope', description: 'Locația Azure pentru AKS.')
    string(name: 'ADMIN_CIDR', defaultValue: '0.0.0.0/0', description: 'CIDR-ul permis pentru access admin/API.')
    string(name: 'KEY_NAME', defaultValue: '', description: 'EC2 KeyPair folosit la nodurile self-managed sau EKS.')
    string(name: 'SSH_USER', defaultValue: 'ubuntu', description: 'User-ul folosit de Ansible/SSH pe noduri.')
    string(name: 'ONPREM_INVENTORY_PATH', defaultValue: '', description: 'Path custom pentru inventory on-prem. Dacă lipsește, se folosește inventory-ul implicit.')
    string(name: 'CONTROL_PLANE_ENDPOINT', defaultValue: '', description: 'Endpoint pentru control plane on-prem/self-managed dacă vrei să suprascrii autodetect-ul.')
    string(name: 'EXISTING_POSTGRES_SECRET_NAME', defaultValue: '', description: 'Secret Kubernetes existent din care se pot citi credențialele PostgreSQL.')
    string(name: 'EXISTING_POSTGRES_SERVICE_NAME', defaultValue: '', description: 'Service Kubernetes existent pentru PostgreSQL.')
    booleanParam(name: 'APPLY_INFRA', defaultValue: true, description: 'Rulează provisioning de infrastructură.')
    booleanParam(name: 'CONFIGURE_CLUSTER', defaultValue: true, description: 'Rulează configurarea clusterului.')
    booleanParam(name: 'DEPLOY_APPLICATION', defaultValue: true, description: 'Rulează deployment-ul aplicației.')
    booleanParam(name: 'DEPLOY_REDIS', defaultValue: false, description: 'Rulează deployment-ul Redis pentru request caching.')
    booleanParam(name: 'DEPLOY_OBSERVABILITY', defaultValue: false, description: 'Rulează deployment-ul stack-ului Prometheus + Grafana + Fluent Bit.')
    booleanParam(name: 'PUSH_IMAGE', defaultValue: false, description: 'Face push la imagine după build.')
    booleanParam(name: 'AUTO_DISCOVER_POSTGRES', defaultValue: true, description: 'Încearcă să găsească o bază PostgreSQL existentă înainte de deploy.')
    booleanParam(name: 'RUN_SMOKE_TEST', defaultValue: false, description: 'Rulează un smoke test HTTP după deploy, dacă URL-ul este accesibil din Jenkins.')
    string(name: 'REDIS_PASSWORD', defaultValue: 'change-me', description: 'Parola folosită de instanța Redis din cluster.')
    string(name: 'REDIS_STORAGE_SIZE', defaultValue: '5Gi', description: 'Dimensiunea volumului persistent pentru Redis.')
    string(name: 'REQUEST_CACHE_DEFAULT_TTL_SECONDS', defaultValue: '60', description: 'TTL implicit pentru răspunsurile GET cache-uite în Redis.')
    string(name: 'OBSERVABILITY_NAMESPACE', defaultValue: 'observability', description: 'Namespace Kubernetes pentru Prometheus, Grafana și Fluent Bit.')
    string(name: 'GRAFANA_INGRESS_HOST', defaultValue: 'grafana.example.com', description: 'Host-ul de ingress pentru Grafana.')
    string(name: 'PROMETHEUS_INGRESS_HOST', defaultValue: 'prometheus.example.com', description: 'Host-ul de ingress pentru Prometheus.')
    string(name: 'GRAFANA_ADMIN_USER', defaultValue: 'admin', description: 'Utilizatorul administrator pentru Grafana.')
    string(name: 'GRAFANA_ADMIN_PASSWORD', defaultValue: 'change-me', description: 'Parola administratorului Grafana.')
  }

  environment {
    GENERATED_DIR = "${WORKSPACE}/config/jenkins/generated/${params.ENVIRONMENT}"
    TARGET_PLATFORM = "${params.TARGET_PLATFORM}"
    PROVISIONER = "${params.PROVISIONER}"
    DATABASE_MODE = "${params.DATABASE_MODE}"
    ENVIRONMENT = "${params.ENVIRONMENT}"
    NAMESPACE = "${params.NAMESPACE}"
    APP_PUBLIC_URL = "${params.APP_PUBLIC_URL}"
    APP_INGRESS_HOST = "${params.APP_INGRESS_HOST}"
    IMAGE_REPOSITORY = "${params.IMAGE_REPOSITORY}"
    IMAGE_TAG = "${params.IMAGE_TAG}"
    AWS_REGION = "${params.AWS_REGION}"
    AZURE_LOCATION = "${params.AZURE_LOCATION}"
    ADMIN_CIDR = "${params.ADMIN_CIDR}"
    KEY_NAME = "${params.KEY_NAME}"
    SSH_USER = "${params.SSH_USER}"
    ONPREM_INVENTORY_PATH = "${params.ONPREM_INVENTORY_PATH}"
    CONTROL_PLANE_ENDPOINT = "${params.CONTROL_PLANE_ENDPOINT}"
    EXISTING_POSTGRES_SECRET_NAME = "${params.EXISTING_POSTGRES_SECRET_NAME}"
    EXISTING_POSTGRES_SERVICE_NAME = "${params.EXISTING_POSTGRES_SERVICE_NAME}"
    AUTO_DISCOVER_POSTGRES = "${params.AUTO_DISCOVER_POSTGRES}"
    RUN_SMOKE_TEST = "${params.RUN_SMOKE_TEST}"
    PUSH_IMAGE = "${params.PUSH_IMAGE}"
    REDIS_PASSWORD = "${params.REDIS_PASSWORD}"
    REDIS_STORAGE_SIZE = "${params.REDIS_STORAGE_SIZE}"
    REQUEST_CACHE_DEFAULT_TTL_SECONDS = "${params.REQUEST_CACHE_DEFAULT_TTL_SECONDS}"
    OBSERVABILITY_NAMESPACE = "${params.OBSERVABILITY_NAMESPACE}"
    GRAFANA_INGRESS_HOST = "${params.GRAFANA_INGRESS_HOST}"
    PROMETHEUS_INGRESS_HOST = "${params.PROMETHEUS_INGRESS_HOST}"
    GRAFANA_ADMIN_USER = "${params.GRAFANA_ADMIN_USER}"
    GRAFANA_ADMIN_PASSWORD = "${params.GRAFANA_ADMIN_PASSWORD}"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        sh 'mkdir -p "$GENERATED_DIR"'
        sh 'chmod +x config/jenkins/scripts/*.sh config/docker/*.sh'
      }
    }

    stage('Validate Parameters') {
      steps {
        script {
          if (params.TARGET_PLATFORM == 'onprem' && params.PROVISIONER != 'none') {
            error('Pentru on-prem, PROVISIONER trebuie să fie "none".')
          }

          if ((params.TARGET_PLATFORM == 'aws-ec2' || params.TARGET_PLATFORM == 'aws-eks') &&
              params.PROVISIONER == 'none' &&
              params.APPLY_INFRA) {
            error('Pentru țintele AWS, dacă APPLY_INFRA este true, PROVISIONER nu poate fi "none".')
          }

          if (params.TARGET_PLATFORM == 'azure-aks' && params.PROVISIONER != 'terraform') {
            error('Pentru AKS este suportat doar Terraform.')
          }

          if (params.PROVISIONER == 'cloudformation' &&
              !(params.TARGET_PLATFORM == 'aws-ec2' || params.TARGET_PLATFORM == 'aws-eks')) {
            error('CloudFormation este disponibil doar pentru aws-ec2 și aws-eks.')
          }
        }
      }
    }

    stage('Build Image') {
      steps {
        sh 'config/jenkins/scripts/build-image.sh'
      }
    }

    stage('Provision Infrastructure') {
      when {
        expression {
          return params.APPLY_INFRA && params.TARGET_PLATFORM != 'onprem' && params.PROVISIONER != 'none'
        }
      }
      steps {
        sh 'config/jenkins/scripts/provision-infra.sh'
      }
    }

    stage('Prepare Cluster Access') {
      when {
        expression {
          return params.CONFIGURE_CLUSTER || params.DEPLOY_APPLICATION || params.DEPLOY_REDIS || params.DEPLOY_OBSERVABILITY
        }
      }
      steps {
        sh 'config/jenkins/scripts/prepare-cluster-access.sh'
      }
    }

    stage('Configure Self-Managed Cluster') {
      when {
        expression {
          return params.CONFIGURE_CLUSTER && (params.TARGET_PLATFORM == 'aws-ec2' || params.TARGET_PLATFORM == 'onprem')
        }
      }
      steps {
        sh 'config/jenkins/scripts/configure-self-managed-cluster.sh'
      }
    }

    stage('Acquire Managed Kubeconfig') {
      when {
        expression {
          return (params.CONFIGURE_CLUSTER || params.DEPLOY_APPLICATION || params.DEPLOY_REDIS || params.DEPLOY_OBSERVABILITY) &&
            (params.TARGET_PLATFORM == 'aws-eks' || params.TARGET_PLATFORM == 'azure-aks')
        }
      }
      steps {
        sh 'config/jenkins/scripts/acquire-managed-kubeconfig.sh'
      }
    }

    stage('Deploy Redis Cache') {
      when {
        expression {
          return params.DEPLOY_REDIS
        }
      }
      steps {
        sh 'config/jenkins/scripts/deploy-redis.sh'
      }
    }

    stage('Discover PostgreSQL') {
      when {
        expression {
          return params.DEPLOY_APPLICATION
        }
      }
      steps {
        sh 'config/jenkins/scripts/discover-postgresql.sh'
      }
    }

    stage('Deploy Application') {
      when {
        expression {
          return params.DEPLOY_APPLICATION
        }
      }
      steps {
        sh 'config/jenkins/scripts/deploy-application.sh'
      }
    }

    stage('Deploy Observability') {
      when {
        expression {
          return params.DEPLOY_OBSERVABILITY
        }
      }
      steps {
        sh 'config/jenkins/scripts/deploy-observability.sh'
      }
    }

    stage('Post-Deploy Checks') {
      when {
        expression {
          return params.DEPLOY_APPLICATION
        }
      }
      steps {
        sh 'config/jenkins/scripts/post-deploy-checks.sh'
      }
    }

    stage('Verify Redis Cache') {
      when {
        expression {
          return params.DEPLOY_REDIS
        }
      }
      steps {
        sh 'config/jenkins/scripts/verify-redis.sh'
      }
    }

    stage('Verify Observability') {
      when {
        expression {
          return params.DEPLOY_OBSERVABILITY
        }
      }
      steps {
        sh 'config/jenkins/scripts/verify-observability.sh'
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'config/jenkins/generated/**/*', allowEmptyArchive: true
    }
  }
}
