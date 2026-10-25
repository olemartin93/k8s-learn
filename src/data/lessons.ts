import { S } from './sources';
import type { Lesson } from './types';

export const lessons: readonly Lesson[] = [
  // ───────────── Basics ─────────────
  {
    id: 'basics-what-is-k8s',
    topic: 'basics',
    title: 'What is Kubernetes?',
    tldr: 'Kubernetes is an open-source platform for running and managing containerized workloads and services, using declarative configuration and automation.',
    points: [
      'You describe the desired state (e.g. "3 replicas of my web app"); Kubernetes continuously works to make the actual state match.',
      'It provides service discovery, load balancing, storage orchestration, automated rollouts and rollbacks, self-healing and secret management.',
      'It is not a traditional all-inclusive PaaS: it gives building blocks and stays flexible about the tools you add on top.',
    ],
    source: S.overview,
  },
  {
    id: 'basics-objects',
    topic: 'basics',
    title: 'Kubernetes objects: spec vs status',
    tldr: 'Objects are persistent records of intent. You write the spec (desired state); Kubernetes reports the status (current state).',
    points: [
      'Almost every object has a `spec` you provide and a `status` the system updates.',
      'Manifests are usually written in YAML and need `apiVersion`, `kind`, `metadata` and `spec`.',
      'Controllers run reconcile loops that compare spec with status and act to close the gap.',
    ],
    example: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 3`,
    source: S.objects,
  },
  {
    id: 'basics-namespaces',
    topic: 'basics',
    title: 'Namespaces',
    tldr: 'Namespaces split a single cluster into virtual sub-clusters so teams and apps can share it without name clashes.',
    points: [
      'Names of resources must be unique within a namespace, not across namespaces.',
      'A new cluster starts with `default`, `kube-system`, `kube-public` and `kube-node-lease`.',
      'Some objects are cluster-scoped and do not live in a namespace, e.g. Nodes, PersistentVolumes and StorageClasses.',
    ],
    example: 'kubectl get pods -n kube-system',
    source: S.namespaces,
  },
  {
    id: 'basics-labels',
    topic: 'basics',
    title: 'Labels, selectors and annotations',
    tldr: 'Labels are key/value pairs used to organize and select objects. Annotations hold non-identifying metadata.',
    points: [
      'Services, Deployments and ReplicaSets find their Pods using label selectors.',
      'Selectors can be equality-based (`app=web`) or set-based (`env in (prod,qa)`).',
      'Annotations are for tools and humans (build info, URLs, owner) and are not used for selection.',
    ],
    example: 'kubectl get pods -l app=web,tier=frontend',
    source: S.labels,
  },

  // ───────────── Architecture ─────────────
  {
    id: 'arch-control-plane',
    topic: 'architecture',
    title: 'The control plane',
    tldr: 'The control plane makes global decisions about the cluster and responds to events. Its core parts are kube-apiserver, etcd, kube-scheduler and kube-controller-manager.',
    points: [
      'kube-apiserver is the front end: everything (kubectl, kubelets, controllers) talks to the API server.',
      'etcd is a consistent, highly-available key-value store that holds all cluster data.',
      'kube-scheduler picks a node for newly created Pods that have no node assigned.',
      'kube-controller-manager runs the built-in controllers (Node, Job, EndpointSlice, ServiceAccount, …).',
      'cloud-controller-manager (optional) links the cluster to a cloud provider API.',
    ],
    source: S.components,
  },
  {
    id: 'arch-nodes',
    topic: 'architecture',
    title: 'Node components',
    tldr: 'Every worker node runs a kubelet, a container runtime and usually kube-proxy.',
    points: [
      'kubelet makes sure the containers described in PodSpecs are running and healthy on its node.',
      'kube-proxy maintains network rules that implement Services (it is optional if your network plugin replaces it).',
      'The container runtime (e.g. containerd or CRI-O) actually runs containers via the Container Runtime Interface (CRI).',
    ],
    source: S.components,
  },
  {
    id: 'arch-controllers',
    topic: 'architecture',
    title: 'Controllers and the reconcile loop',
    tldr: 'A controller is a non-terminating control loop that watches the shared state of the cluster and makes changes to move the current state toward the desired state.',
    points: [
      'Think of a thermostat: you set a temperature, it keeps adjusting to reach it.',
      'Controllers usually act by calling the API server, not by touching containers directly.',
      'You can write your own controllers (see Operators) to manage custom resources.',
    ],
    source: S.controllers,
  },
  {
    id: 'arch-etcd',
    topic: 'architecture',
    title: 'etcd – the cluster brain',
    tldr: 'etcd stores the entire cluster state. Lose etcd without a backup and you lose the cluster configuration.',
    points: [
      'etcd uses the Raft consensus algorithm, so an odd number of members (3 or 5) is recommended for high availability.',
      'Take regular snapshots (e.g. `etcdctl snapshot save`) as part of disaster recovery.',
      'Only the API server should talk to etcd directly.',
    ],
    source: S.etcdTask,
  },

  // ───────────── Workloads ─────────────
  {
    id: 'wl-pods',
    topic: 'workloads',
    title: 'Pods',
    tldr: 'A Pod is the smallest deployable unit: one or more containers that share network and storage and are scheduled together.',
    points: [
      'Containers in a Pod share an IP address and can talk over `localhost`.',
      'Pods are ephemeral and disposable — you rarely create them directly; controllers create them for you.',
      'Common multi-container patterns include sidecars and init containers.',
    ],
    example: 'kubectl run nginx --image=nginx',
    source: S.pods,
  },
  {
    id: 'wl-deployments',
    topic: 'workloads',
    title: 'Deployments',
    tldr: 'A Deployment manages ReplicaSets to give declarative updates, rolling updates and rollbacks for stateless apps.',
    points: [
      'Deployment → ReplicaSet → Pods. Each change to the Pod template creates a new ReplicaSet.',
      'Default strategy is RollingUpdate with maxSurge and maxUnavailable both at 25%.',
      'Use `kubectl rollout status`, `rollout history` and `rollout undo` to manage rollouts.',
    ],
    example: `kubectl create deployment web --image=nginx --replicas=3
kubectl rollout undo deployment/web`,
    source: S.deployment,
  },
  {
    id: 'wl-statefulsets',
    topic: 'workloads',
    title: 'StatefulSets',
    tldr: 'StatefulSets run stateful apps where each Pod needs a stable, unique identity and its own persistent storage.',
    points: [
      'Pods get ordinal names like `db-0`, `db-1`, `db-2` that survive rescheduling.',
      'By default Pods are created, scaled and deleted in order.',
      'Usually paired with a headless Service for stable DNS names and volumeClaimTemplates for per-Pod storage.',
    ],
    source: S.statefulset,
  },
  {
    id: 'wl-daemonsets',
    topic: 'workloads',
    title: 'DaemonSets',
    tldr: 'A DaemonSet ensures that all (or some) nodes run a copy of a Pod.',
    points: [
      'Typical uses: log collectors, monitoring agents, network plugins and storage daemons.',
      'When a node joins the cluster, the DaemonSet Pod is added to it automatically.',
      'Use node selectors or affinity to target only some nodes.',
    ],
    source: S.daemonset,
  },
  {
    id: 'wl-jobs',
    topic: 'workloads',
    title: 'Jobs and CronJobs',
    tldr: 'A Job runs Pods until a set number complete successfully. A CronJob creates Jobs on a repeating schedule.',
    points: [
      'Jobs retry failed Pods up to `backoffLimit` (default 6).',
      'CronJob schedules use standard cron syntax, e.g. `0 3 * * *` for 03:00 every day.',
      'Use `ttlSecondsAfterFinished` to clean up finished Jobs automatically.',
    ],
    example: 'kubectl create cronjob backup --image=busybox --schedule="0 3 * * *" -- echo hi',
    source: S.job,
  },

  // ───────────── Networking ─────────────
  {
    id: 'net-model',
    topic: 'networking',
    title: 'The Kubernetes network model',
    tldr: 'Every Pod gets its own cluster-wide IP, and Pods can reach all other Pods without NAT.',
    points: [
      'Network plugins (CNI) such as Calico, Cilium or Flannel implement the model.',
      'Pod IPs change when Pods are recreated, which is why Services exist.',
      'Agents on a node (like kubelet) can talk to all Pods on that node.',
    ],
    source: S.networking,
  },
  {
    id: 'net-services',
    topic: 'networking',
    title: 'Services',
    tldr: 'A Service gives a stable virtual IP and DNS name in front of a changing set of Pods selected by labels.',
    points: [
      'ClusterIP (default): reachable only inside the cluster.',
      'NodePort: opens a port on every node (default range 30000–32767).',
      'LoadBalancer: asks the cloud provider for an external load balancer.',
      'ExternalName: maps the Service to an external DNS name via a CNAME.',
      'Headless Service (`clusterIP: None`) returns Pod IPs directly from DNS.',
    ],
    example: 'kubectl expose deployment web --port=80 --type=ClusterIP',
    source: S.service,
  },
  {
    id: 'net-dns',
    topic: 'networking',
    title: 'Cluster DNS',
    tldr: 'Services get DNS names like `my-svc.my-namespace.svc.cluster.local`, so apps can find each other by name.',
    points: [
      'From the same namespace you can simply use `my-svc`.',
      'Most clusters run CoreDNS as the cluster DNS server.',
      '`cluster.local` is the default cluster domain but it can be configured.',
    ],
    source: S.dns,
  },
  {
    id: 'net-ingress-gateway',
    topic: 'networking',
    title: 'Ingress and Gateway API',
    tldr: 'Ingress routes external HTTP(S) traffic to Services. Gateway API is its more expressive, role-oriented successor.',
    points: [
      'An Ingress resource does nothing without an Ingress controller running in the cluster.',
      'The Ingress API is frozen: it still works, but new features go into Gateway API.',
      'Gateway API splits concerns into GatewayClass (infra provider), Gateway (cluster operator) and Routes like HTTPRoute (app developer).',
      'The community ingress-nginx controller was retired in March 2026; Kubernetes recommends migrating to Gateway API.',
    ],
    source: S.gateway,
  },
  {
    id: 'net-netpol',
    topic: 'networking',
    title: 'NetworkPolicies',
    tldr: 'NetworkPolicies are firewall rules for Pods, controlling which traffic is allowed in (ingress) and out (egress).',
    points: [
      'By default Pods accept traffic from anywhere (non-isolated).',
      'Once a policy selects a Pod, only traffic explicitly allowed by some policy is permitted.',
      'They only take effect if your network plugin supports NetworkPolicy.',
    ],
    source: S.netpol,
  },

  // ───────────── Storage ─────────────
  {
    id: 'st-volumes',
    topic: 'storage',
    title: 'Volumes',
    tldr: 'Container filesystems are ephemeral. Volumes give containers in a Pod data that survives container restarts and can be shared.',
    points: [
      '`emptyDir` lives as long as the Pod — great for scratch space shared between containers.',
      'ConfigMaps and Secrets can be mounted as volumes.',
      'Persistent data should use PersistentVolumeClaims.',
    ],
    source: S.volumes,
  },
  {
    id: 'st-pv-pvc',
    topic: 'storage',
    title: 'PersistentVolumes and Claims',
    tldr: 'A PersistentVolume (PV) is a piece of storage in the cluster; a PersistentVolumeClaim (PVC) is a user’s request for storage.',
    points: [
      'PVs are cluster-scoped; PVCs live in a namespace.',
      'Access modes: ReadWriteOnce, ReadOnlyMany, ReadWriteMany and ReadWriteOncePod.',
      'Reclaim policies: Retain or Delete (Recycle is deprecated).',
    ],
    example: `kind: PersistentVolumeClaim
spec:
  accessModes: [ReadWriteOnce]
  resources:
    requests:
      storage: 1Gi`,
    source: S.pv,
  },
  {
    id: 'st-storageclass',
    topic: 'storage',
    title: 'StorageClasses & dynamic provisioning',
    tldr: 'A StorageClass describes a "class" of storage. PVCs that reference it get a PV created automatically.',
    points: [
      'Each StorageClass names a provisioner (usually a CSI driver).',
      'A cluster can mark one StorageClass as the default.',
      '`volumeBindingMode: WaitForFirstConsumer` delays provisioning until a Pod is scheduled.',
    ],
    source: S.storageClass,
  },

  // ───────────── Config ─────────────
  {
    id: 'cfg-configmaps',
    topic: 'config',
    title: 'ConfigMaps',
    tldr: 'ConfigMaps store non-confidential configuration as key/value pairs, decoupling config from container images.',
    points: [
      'Consume them as environment variables, command-line args or files in a volume.',
      'Data in a ConfigMap cannot exceed 1 MiB.',
      'Mark them `immutable: true` to protect against accidental changes and reduce API server load.',
    ],
    example: 'kubectl create configmap app-config --from-literal=LOG_LEVEL=info',
    source: S.configmap,
  },
  {
    id: 'cfg-secrets',
    topic: 'config',
    title: 'Secrets',
    tldr: 'Secrets hold small amounts of sensitive data like passwords and tokens — but by default they are only base64-encoded, not encrypted.',
    points: [
      'Enable encryption at rest for Secrets in etcd.',
      'Use RBAC to limit who can read Secrets.',
      'Anyone allowed to create a Pod in a namespace can use that to read any Secret in that namespace.',
    ],
    example: 'kubectl create secret generic db --from-literal=password=s3cr3t',
    source: S.secret,
  },
  {
    id: 'cfg-resources',
    topic: 'config',
    title: 'Requests and limits',
    tldr: 'Requests are what the scheduler reserves for a container; limits are the maximum it may use.',
    points: [
      'CPU is measured in cores (`500m` = half a core); memory in bytes (`256Mi`).',
      'A container over its CPU limit is throttled; over its memory limit it can be OOM-killed.',
      'Requests and limits decide the Pod QoS class: Guaranteed, Burstable or BestEffort.',
    ],
    source: S.resources,
  },
  {
    id: 'cfg-probes',
    topic: 'config',
    title: 'Liveness, readiness and startup probes',
    tldr: 'Probes let the kubelet check container health: liveness restarts, readiness controls traffic, startup protects slow starters.',
    points: [
      'Failing liveness probe → kubelet restarts the container.',
      'Failing readiness probe → Pod is removed from Service endpoints but not restarted.',
      'Startup probe disables the other probes until the app has started.',
      'Probe types: HTTP GET, TCP socket, gRPC and exec.',
    ],
    source: S.probes,
  },

  // ───────────── Security ─────────────
  {
    id: 'sec-rbac',
    topic: 'security',
    title: 'RBAC',
    tldr: 'Role-Based Access Control grants permissions (verbs on resources) to users, groups and ServiceAccounts.',
    points: [
      'Role / RoleBinding are namespaced; ClusterRole / ClusterRoleBinding are cluster-wide.',
      'RBAC permissions are purely additive — there are no "deny" rules.',
      'Test access with `kubectl auth can-i`.',
    ],
    example: 'kubectl auth can-i delete pods --as=jane -n dev',
    source: S.rbac,
  },
  {
    id: 'sec-serviceaccounts',
    topic: 'security',
    title: 'ServiceAccounts',
    tldr: 'ServiceAccounts give an identity to processes running in Pods so they can authenticate to the API server.',
    points: [
      'Every namespace gets a `default` ServiceAccount automatically.',
      'Modern clusters use short-lived, automatically rotated projected tokens.',
      'Follow least privilege: create dedicated ServiceAccounts with only the RBAC they need.',
    ],
    source: S.serviceAccounts,
  },
  {
    id: 'sec-pss',
    topic: 'security',
    title: 'Pod Security Standards',
    tldr: 'Three built-in security profiles — Privileged, Baseline and Restricted — enforced per namespace by Pod Security Admission.',
    points: [
      'Privileged: unrestricted. Baseline: blocks known privilege escalations. Restricted: hardened best practices.',
      'Apply via namespace labels like `pod-security.kubernetes.io/enforce: restricted`.',
      'Modes: enforce, audit and warn.',
      'Pod Security Admission replaced PodSecurityPolicy, which was removed in v1.25.',
    ],
    source: S.psa,
  },

  // ───────────── Scheduling ─────────────
  {
    id: 'sch-scheduler',
    topic: 'scheduling',
    title: 'How scheduling works',
    tldr: 'kube-scheduler filters nodes that can run a Pod, scores the remaining ones and binds the Pod to the best node.',
    points: [
      'Filtering checks things like resource requests, node selectors and taints.',
      'Scoring ranks feasible nodes, e.g. spreading Pods or preferring nodes with images.',
      'A Pod that fits nowhere stays Pending.',
    ],
    source: S.scheduler,
  },
  {
    id: 'sch-taints',
    topic: 'scheduling',
    title: 'Taints and tolerations',
    tldr: 'Taints on a node repel Pods; tolerations on a Pod allow (but do not force) it onto tainted nodes.',
    points: [
      'Effects: NoSchedule, PreferNoSchedule and NoExecute (evicts running Pods).',
      'Control-plane nodes are commonly tainted so normal workloads avoid them.',
      'Combine with node affinity to dedicate nodes to specific workloads.',
    ],
    example: 'kubectl taint nodes node1 gpu=true:NoSchedule',
    source: S.taints,
  },
  {
    id: 'sch-affinity',
    topic: 'scheduling',
    title: 'Node selectors and affinity',
    tldr: 'nodeSelector and node affinity attract Pods to nodes with matching labels; Pod (anti-)affinity places Pods relative to other Pods.',
    points: [
      '`requiredDuringSchedulingIgnoredDuringExecution` is a hard rule; `preferred…` is a soft preference.',
      'Pod anti-affinity is often used to spread replicas across nodes or zones.',
      'Topology spread constraints offer finer control over spreading.',
    ],
    source: S.assignPod,
  },
  {
    id: 'sch-hpa',
    topic: 'scheduling',
    title: 'Horizontal Pod Autoscaler',
    tldr: 'The HPA automatically changes the number of replicas of a workload based on observed metrics such as CPU utilization.',
    points: [
      'CPU/memory based scaling needs the metrics-server (Metrics API).',
      'Horizontal scaling = more Pods; vertical scaling = more resources per Pod.',
      'Requests must be set for utilization-percentage targets to work.',
    ],
    example: 'kubectl autoscale deployment web --cpu-percent=70 --min=2 --max=10',
    source: S.hpa,
  },

  // ───────────── kubectl ─────────────
  {
    id: 'kc-basics',
    topic: 'kubectl',
    title: 'kubectl essentials',
    tldr: 'kubectl talks to the API server. Learn get, describe, logs, exec, apply and delete and you can do most daily work.',
    points: [
      '`kubectl get pods -o wide` – list with extra columns (node, IP).',
      '`kubectl describe pod <name>` – details plus recent events (great for debugging).',
      '`kubectl logs <pod> -f` – stream logs; add `--previous` for a crashed container.',
      '`kubectl exec -it <pod> -- sh` – open a shell in a container.',
      '`kubectl explain deployment.spec` – built-in API documentation.',
    ],
    source: S.kubectlCheat,
  },
  {
    id: 'kc-declarative',
    topic: 'kubectl',
    title: 'Declarative vs imperative',
    tldr: 'Imperative commands (`create`, `run`) are quick; declarative `kubectl apply -f` with files in Git is the reproducible way.',
    points: [
      '`kubectl apply -f dir/` creates or updates all manifests in a folder.',
      '`kubectl diff -f file.yaml` previews what would change.',
      'Generate YAML fast with `--dry-run=client -o yaml`.',
    ],
    example: 'kubectl create deployment web --image=nginx --dry-run=client -o yaml > web.yaml',
    source: S.kubectl,
  },
  {
    id: 'kc-contexts',
    topic: 'kubectl',
    title: 'kubeconfig and contexts',
    tldr: 'kubeconfig files store clusters, users and contexts. A context = cluster + user + (optional) namespace.',
    points: [
      'Default location: `~/.kube/config` (override with `KUBECONFIG`).',
      '`kubectl config get-contexts` lists contexts; `use-context` switches.',
      'Set a default namespace: `kubectl config set-context --current --namespace=dev`.',
    ],
    source: S.kubeconfig,
  },

  // ───────────── Ecosystem ─────────────
  {
    id: 'eco-helm',
    topic: 'ecosystem',
    title: 'Helm',
    tldr: 'Helm is the package manager for Kubernetes. Packages are called charts; an installed chart is a release.',
    points: [
      'Charts are templated YAML with a `values.yaml` you can override.',
      '`helm install`, `helm upgrade`, `helm rollback` and `helm uninstall` manage releases.',
      'Helm is a graduated CNCF project.',
    ],
    example: 'helm install my-release ./my-chart -f my-values.yaml',
    source: S.helm,
  },
  {
    id: 'eco-crd-operators',
    topic: 'ecosystem',
    title: 'CRDs and Operators',
    tldr: 'CustomResourceDefinitions add new resource types to the API. Operators pair a CRD with a controller that encodes operational knowledge.',
    points: [
      'After installing a CRD you can `kubectl get` your new kind like any built-in.',
      'Operators automate tasks a human operator would do: backups, upgrades, failover.',
      'Examples: database operators, cert-manager, Prometheus Operator.',
    ],
    source: S.operator,
  },
  {
    id: 'eco-runtimes',
    topic: 'ecosystem',
    title: 'Container runtimes & the CRI',
    tldr: 'Kubernetes runs containers through the Container Runtime Interface (CRI). containerd and CRI-O are the common runtimes.',
    points: [
      'Images built with Docker are OCI images and run fine on containerd or CRI-O.',
      'The built-in Docker Engine shim (dockershim) was removed in v1.24.',
      'To use Docker Engine as a runtime today you need the external cri-dockerd adapter.',
    ],
    source: S.runtimes,
  },
  {
    id: 'eco-local-clusters',
    topic: 'ecosystem',
    title: 'Local clusters: kind & minikube',
    tldr: 'kind runs Kubernetes nodes as Docker containers; minikube runs a local cluster in a VM, container or on bare metal.',
    points: [
      'kind (“Kubernetes IN Docker”) was built for testing Kubernetes itself and is popular in CI.',
      'minikube has handy addons like ingress, dashboard and metrics-server.',
      'Docker Desktop and Rancher Desktop also ship a built-in local cluster.',
    ],
    source: S.kind,
  },

  // ───────────── Docker Desktop ─────────────
  {
    id: 'dd-what',
    topic: 'docker-desktop',
    title: 'Docker vs Docker Desktop',
    tldr: 'Docker is the container platform (engine, CLI, images). Docker Desktop is an app for macOS, Windows and Linux that bundles the engine, CLI, Compose, BuildKit and an optional Kubernetes cluster.',
    points: [
      'Docker packages apps into images that run as containers.',
      'On macOS and Windows, Docker Desktop runs the Linux engine inside a lightweight VM.',
      'Docker Compose is great locally; Kubernetes is for orchestrating across many machines.',
    ],
    source: S.dockerDesktop,
  },
  {
    id: 'dd-k8s',
    topic: 'docker-desktop',
    title: 'Kubernetes in Docker Desktop',
    tldr: 'Docker Desktop includes a standalone local Kubernetes cluster you turn on in Settings → Kubernetes. kubectl gets a `docker-desktop` context.',
    points: [
      'The cluster is for local development and testing, not production.',
      'Two provisioning methods: kubeadm (single node, fixed version) or kind (multi-node, choose the Kubernetes version).',
      'Switch to it with `kubectl config use-context docker-desktop`.',
    ],
    example: `kubectl config use-context docker-desktop
kubectl get nodes`,
    source: S.dockerDesktopK8s,
  },
  {
    id: 'dd-license',
    topic: 'docker-desktop',
    title: 'Docker Desktop licensing',
    tldr: 'Docker Desktop is free for personal use, education, non-commercial open source and small businesses; larger companies need a paid subscription.',
    points: [
      'Small business = fewer than 250 employees AND less than $10 million in annual revenue.',
      'The Docker Engine itself (Moby) remains open source.',
      'Alternatives with a local cluster include Rancher Desktop, minikube and kind.',
    ],
    source: S.dockerLicense,
  },

  // ───────────── Rancher ─────────────
  {
    id: 'rn-manager',
    topic: 'rancher',
    title: 'Rancher Manager',
    tldr: 'Rancher is an open-source multi-cluster management platform: one UI and API to provision, import and manage many Kubernetes clusters anywhere.',
    points: [
      'It can create RKE2 and K3s clusters, or import existing ones such as EKS, AKS and GKE.',
      'Centralized authentication, RBAC, monitoring and app catalog across clusters.',
      'Rancher itself runs on a Kubernetes cluster (the "local" cluster).',
    ],
    source: S.rancher,
  },
  {
    id: 'rn-k3s',
    topic: 'rancher',
    title: 'K3s',
    tldr: 'K3s is a lightweight, fully conformant Kubernetes distribution packaged as a single binary — ideal for edge, IoT, CI and small clusters.',
    points: [
      'Created by Rancher Labs and now a CNCF project.',
      'Uses containerd and ships with defaults like Flannel, CoreDNS, Traefik and a local-path storage provisioner.',
      'Can use embedded SQLite or etcd, or an external datastore.',
    ],
    example: 'curl -sfL https://get.k3s.io | sh -',
    source: S.k3s,
  },
  {
    id: 'rn-rke2',
    topic: 'rancher',
    title: 'RKE2',
    tldr: 'RKE2 is Rancher’s security-focused, fully conformant Kubernetes distribution, aimed at compliance-heavy environments like the US government.',
    points: [
      'Designed to pass the CIS Kubernetes Benchmark with minimal operator intervention, and supports FIPS 140-2.',
      'Uses containerd (no Docker dependency) and runs control-plane components as static Pods.',
      'RKE1 reached end of life on July 31, 2025 — RKE2 (or K3s) is the replacement.',
    ],
    source: S.rke2,
  },
  {
    id: 'rn-fleet-desktop',
    topic: 'rancher',
    title: 'Fleet and Rancher Desktop',
    tldr: 'Fleet is Rancher’s GitOps engine for deploying to many clusters. Rancher Desktop is a free desktop app running K3s locally.',
    points: [
      'Fleet watches Git repositories and rolls out manifests, Helm charts or Kustomize to fleets of clusters.',
      'Rancher Desktop runs on macOS, Windows (WSL 2) and Linux.',
      'In Rancher Desktop you choose the container engine: containerd (with nerdctl) or dockerd/Moby (with the docker CLI).',
    ],
    source: S.rancherDesktop,
  },

  // ───────────── History ─────────────
  {
    id: 'hist-borg',
    topic: 'history',
    title: 'Borg and Omega',
    tldr: 'Kubernetes was inspired by Borg, Google’s internal cluster manager, and its successor research system Omega.',
    points: [
      'Borg ran hundreds of thousands of jobs across many clusters at Google.',
      'Lessons from Borg, like grouping containers (Pods) and labels, shaped Kubernetes.',
      'Google published the Borg paper at EuroSys in 2015.',
    ],
    source: S.borgBlog,
  },
  {
    id: 'hist-birth',
    topic: 'history',
    title: 'Birth of Kubernetes (2014–2015)',
    tldr: 'Google open-sourced Kubernetes in June 2014. Version 1.0 arrived in July 2015, alongside the founding of the CNCF.',
    points: [
      'Founders include Joe Beda, Brendan Burns and Craig McLuckie, joined early by Brian Grant, Tim Hockin and others.',
      'The name is Greek for "helmsman" or "pilot"; "K8s" counts the 8 letters between K and s.',
      'The internal codename was "Project Seven" — a Star Trek nod (Seven of Nine), which is why the logo wheel has seven spokes.',
      'Google donated Kubernetes to the new Cloud Native Computing Foundation (part of the Linux Foundation).',
    ],
    source: S.history,
  },
  {
    id: 'hist-graduation',
    topic: 'history',
    title: 'Graduation and growth',
    tldr: 'In March 2018 Kubernetes became the first project to graduate from the CNCF.',
    points: [
      'Graduation signals maturity, wide adoption and healthy governance.',
      'The first KubeCon took place in San Francisco in November 2015.',
      'Today Kubernetes ships about three minor releases per year.',
    ],
    source: S.cncfGraduation,
  },
  {
    id: 'hist-dockershim',
    topic: 'history',
    title: 'Goodbye dockershim (2020–2022)',
    tldr: 'Kubernetes deprecated dockershim in v1.20 (Dec 2020) and removed it in v1.24 (May 2022). Docker-built images still work.',
    points: [
      'Kubernetes only removed its built-in adapter to Docker Engine — not support for Docker images.',
      'Clusters moved to CRI runtimes like containerd and CRI-O.',
      'The famous blog post was titled "Don’t Panic: Kubernetes and Docker".',
    ],
    source: S.dontPanic,
  },
  {
    id: 'hist-releases',
    topic: 'history',
    title: 'Releases and support',
    tldr: 'The project maintains the three most recent minor releases; each gets roughly 14 months of patch support.',
    points: [
      'Versions follow semantic versioning: `x.y.z` = major.minor.patch.',
      'kubelet may be up to three minor versions older than kube-apiserver.',
      'kubectl is supported within one minor version (older or newer) of kube-apiserver.',
    ],
    source: S.skew,
  },
];
