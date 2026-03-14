output "vpc_id" {
  value = aws_vpc.this.id
}

output "bastion_public_ip" {
  value = aws_instance.bastion.public_ip
}

output "control_plane_private_ip" {
  value = aws_instance.control_plane.private_ip
}

output "worker_private_ips" {
  value = aws_instance.workers[*].private_ip
}

output "ansible_inventory_hint" {
  value = {
    control_plane = aws_instance.control_plane.private_ip
    workers       = aws_instance.workers[*].private_ip
  }
}

