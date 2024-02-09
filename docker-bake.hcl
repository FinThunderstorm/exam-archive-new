variable "BUILDTARGET" {
  default="prod"
}

target "docker-metadata-action" {}

target "default" {
  inherits = ["docker-metadata-action"]
  context = "./"
  dockerfile = "Dockerfile"
  target = "${BUILDTARGET}"
}