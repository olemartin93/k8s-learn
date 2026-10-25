import { S } from './sources';
import type { Flashcard } from './types';

export const flashcards: readonly Flashcard[] = [
  { id: 'f-pod', topic: 'workloads', front: 'Pod', back: 'Smallest deployable unit: one or more containers sharing network (IP) and storage, scheduled together.', source: S.pods },
  { id: 'f-replicaset', topic: 'workloads', front: 'ReplicaSet', back: 'Keeps a stable set of replica Pods running. Usually managed by a Deployment.', source: S.replicaset },
  { id: 'f-deployment', topic: 'workloads', front: 'Deployment', back: 'Declarative updates for Pods and ReplicaSets: rolling updates, rollbacks and scaling for stateless apps.', source: S.deployment },
  { id: 'f-statefulset', topic: 'workloads', front: 'StatefulSet', back: 'For stateful apps: stable Pod names (app-0, app-1), ordered rollout and per-Pod persistent storage.', source: S.statefulset },
  { id: 'f-daemonset', topic: 'workloads', front: 'DaemonSet', back: 'Runs a copy of a Pod on all (or selected) nodes, e.g. log or monitoring agents.', source: S.daemonset },
  { id: 'f-job', topic: 'workloads', front: 'Job vs CronJob', back: 'Job: runs Pods until they complete successfully. CronJob: creates Jobs on a cron schedule.', source: S.job },
  { id: 'f-init', topic: 'workloads', front: 'Init container', back: 'Runs to completion before app containers start; used for setup tasks.', source: S.initContainers },

  { id: 'f-apiserver', topic: 'architecture', front: 'kube-apiserver', back: 'Front end of the control plane; exposes the Kubernetes API. Everything talks to it.', source: S.components },
  { id: 'f-etcd', topic: 'architecture', front: 'etcd', back: 'Consistent, highly-available key-value store holding all cluster data. Back it up!', source: S.components },
  { id: 'f-scheduler', topic: 'architecture', front: 'kube-scheduler', back: 'Assigns newly created Pods to nodes by filtering and scoring.', source: S.components },
  { id: 'f-kcm', topic: 'architecture', front: 'kube-controller-manager', back: 'Runs the built-in controllers (Node, Job, EndpointSlice, ServiceAccount…).', source: S.components },
  { id: 'f-kubelet', topic: 'architecture', front: 'kubelet', back: 'Node agent that ensures containers in its Pods are running and healthy.', source: S.components },
  { id: 'f-kubeproxy', topic: 'architecture', front: 'kube-proxy', back: 'Maintains node network rules that implement Services (optional with some CNIs).', source: S.components },
  { id: 'f-controller', topic: 'architecture', front: 'Controller', back: 'A control loop that watches cluster state and moves the current state toward the desired state.', source: S.controllers },

  { id: 'f-clusterip', topic: 'networking', front: 'ClusterIP', back: 'Default Service type: a virtual IP reachable only inside the cluster.', source: S.service },
  { id: 'f-nodeport', topic: 'networking', front: 'NodePort', back: 'Exposes a Service on a static port on every node (default 30000–32767).', source: S.service },
  { id: 'f-lb', topic: 'networking', front: 'LoadBalancer', back: 'Service type that provisions an external load balancer from the cloud provider.', source: S.service },
  { id: 'f-headless', topic: 'networking', front: 'Headless Service', back: '`clusterIP: None` — DNS returns Pod IPs directly. Common with StatefulSets.', source: S.service },
  { id: 'f-dns', topic: 'networking', front: 'Service DNS name', back: '<service>.<namespace>.svc.cluster.local', source: S.dns },
  { id: 'f-ingress', topic: 'networking', front: 'Ingress', back: 'HTTP(S) routing rules from outside to Services. Needs an Ingress controller. API is frozen in favour of Gateway API.', source: S.ingress },
  { id: 'f-gateway', topic: 'networking', front: 'Gateway API roles', back: 'GatewayClass (infra provider) → Gateway (cluster operator) → HTTPRoute etc. (app developer).', source: S.gateway },
  { id: 'f-netpol', topic: 'networking', front: 'NetworkPolicy', back: 'Pod-level firewall rules for ingress/egress. Requires a CNI that supports it.', source: S.netpol },

  { id: 'f-pv', topic: 'storage', front: 'PV vs PVC', back: 'PersistentVolume = a piece of storage (cluster-scoped). PersistentVolumeClaim = a request for storage (namespaced).', source: S.pv },
  { id: 'f-access', topic: 'storage', front: 'Access modes', back: 'RWO (one node), ROX (read-only many), RWX (read-write many), RWOP (one Pod).', source: S.pv },
  { id: 'f-sc', topic: 'storage', front: 'StorageClass', back: 'Describes a class of storage and its provisioner; enables dynamic provisioning of PVs.', source: S.storageClass },
  { id: 'f-emptydir', topic: 'storage', front: 'emptyDir', back: 'Scratch volume that lives as long as the Pod. Shared by the Pod’s containers.', source: S.volumes },

  { id: 'f-configmap', topic: 'config', front: 'ConfigMap', back: 'Non-confidential key/value config, consumed as env vars, args or files. Max 1 MiB.', source: S.configmap },
  { id: 'f-secret', topic: 'config', front: 'Secret', back: 'Small sensitive data. base64-encoded, NOT encrypted by default — enable encryption at rest + RBAC.', source: S.secret },
  { id: 'f-reqlim', topic: 'config', front: 'Requests vs limits', back: 'Request = reserved for scheduling. Limit = maximum. CPU over limit → throttled; memory over limit → OOMKilled.', source: S.resources },
  { id: 'f-qos', topic: 'config', front: 'QoS classes', back: 'Guaranteed (requests = limits), Burstable (some requests/limits), BestEffort (none).', source: S.qos },
  { id: 'f-probes', topic: 'config', front: 'Liveness vs readiness', back: 'Liveness fails → container restarted. Readiness fails → removed from Service endpoints.', source: S.probes },
  { id: 'f-labels', topic: 'basics', front: 'Labels vs annotations', back: 'Labels: identifying key/values used by selectors. Annotations: non-identifying metadata for tools.', source: S.annotations },
  { id: 'f-namespaces', topic: 'basics', front: 'Default namespaces', back: 'default, kube-system, kube-public, kube-node-lease', source: S.namespaces },
  { id: 'f-desired', topic: 'basics', front: 'Desired state', back: 'What you declare in an object’s spec. Controllers reconcile the actual state (status) toward it.', source: S.objects },

  { id: 'f-rbac', topic: 'security', front: 'Role vs ClusterRole', back: 'Role: permissions in one namespace. ClusterRole: cluster-wide or reusable across namespaces.', source: S.rbac },
  { id: 'f-rbac-add', topic: 'security', front: 'Can RBAC deny?', back: 'No. RBAC is purely additive — permissions are only granted.', source: S.rbac },
  { id: 'f-sa', topic: 'security', front: 'ServiceAccount', back: 'Identity for processes in Pods to authenticate to the API server.', source: S.serviceAccounts },
  { id: 'f-pss', topic: 'security', front: 'Pod Security Standards', back: 'Privileged → Baseline → Restricted. Enforced by Pod Security Admission via namespace labels.', source: S.pss },

  { id: 'f-taint', topic: 'scheduling', front: 'Taint vs toleration', back: 'Taint (node) repels Pods. Toleration (Pod) allows — but does not force — scheduling there.', source: S.taints },
  { id: 'f-taint-effects', topic: 'scheduling', front: 'Taint effects', back: 'NoSchedule, PreferNoSchedule, NoExecute (also evicts running Pods).', source: S.taints },
  { id: 'f-affinity', topic: 'scheduling', front: 'Node affinity', back: 'Attracts Pods to nodes by labels. required… = hard rule, preferred… = soft.', source: S.assignPod },
  { id: 'f-hpa', topic: 'scheduling', front: 'HPA', back: 'Horizontal Pod Autoscaler: changes replica count based on metrics like CPU.', source: S.hpa },

  { id: 'f-kc-describe', topic: 'kubectl', front: 'Debug a Pod: first command?', back: '`kubectl describe pod <name>` — check the Events section.', source: S.kubectlCheat },
  { id: 'f-kc-logs', topic: 'kubectl', front: 'Logs of a crashed container', back: '`kubectl logs <pod> --previous`', source: S.kubectlCheat },
  { id: 'f-kc-exec', topic: 'kubectl', front: 'Shell into a container', back: '`kubectl exec -it <pod> -- sh`', source: S.kubectlCheat },
  { id: 'f-kc-dry', topic: 'kubectl', front: 'Scaffold YAML quickly', back: '`kubectl create … --dry-run=client -o yaml`', source: S.kubectlCheat },
  { id: 'f-kc-ctx', topic: 'kubectl', front: 'Switch cluster', back: '`kubectl config use-context <name>`', source: S.kubeconfig },
  { id: 'f-kc-pf', topic: 'kubectl', front: 'Reach a Pod port locally', back: '`kubectl port-forward pod/<name> 8080:80`', source: S.kubectlCheat },

  { id: 'f-helm', topic: 'ecosystem', front: 'Helm chart vs release', back: 'Chart: the package (templates + values). Release: an installed instance of a chart.', source: S.helm },
  { id: 'f-crd', topic: 'ecosystem', front: 'CRD', back: 'CustomResourceDefinition — adds a new resource type to the Kubernetes API.', source: S.crd },
  { id: 'f-operator', topic: 'ecosystem', front: 'Operator', back: 'Custom resources + a controller that encodes how to operate an app (backups, upgrades…).', source: S.operator },
  { id: 'f-cri', topic: 'ecosystem', front: 'CRI / CNI / CSI', back: 'Container Runtime Interface / Container Network Interface / Container Storage Interface.', source: S.runtimes },
  { id: 'f-kind', topic: 'ecosystem', front: 'kind', back: 'Kubernetes IN Docker — runs cluster nodes as Docker containers. Great for CI.', source: S.kind },

  { id: 'f-dd-ctx', topic: 'docker-desktop', front: 'Docker Desktop kube context', back: '`docker-desktop`', source: S.dockerDesktopK8s },
  { id: 'f-dd-modes', topic: 'docker-desktop', front: 'Docker Desktop: kubeadm vs kind', back: 'kubeadm: single node, fixed version. kind: multi-node, selectable Kubernetes version.', source: S.dockerDesktopK8s },
  { id: 'f-dd-license', topic: 'docker-desktop', front: 'Docker Desktop free for…', back: 'Personal use, education, non-commercial open source, and businesses with <250 employees AND <$10M revenue.', source: S.dockerLicense },

  { id: 'f-rn-rancher', topic: 'rancher', front: 'Rancher Manager', back: 'Multi-cluster Kubernetes management: provision, import and manage clusters from one UI/API.', source: S.rancher },
  { id: 'f-rn-k3s', topic: 'rancher', front: 'K3s', back: 'Lightweight single-binary conformant Kubernetes for edge, IoT and dev. CNCF project.', source: S.k3s },
  { id: 'f-rn-rke2', topic: 'rancher', front: 'RKE2', back: 'Security-focused Rancher distribution (CIS, FIPS 140-2), uses containerd. Replaces RKE1 (EOL July 31, 2025).', source: S.rke2 },
  { id: 'f-rn-fleet', topic: 'rancher', front: 'Fleet', back: 'Rancher’s GitOps engine for deploying from Git to many clusters.', source: S.fleet },
  { id: 'f-rn-desktop', topic: 'rancher', front: 'Rancher Desktop', back: 'Free desktop app running K3s locally, with containerd (nerdctl) or dockerd/Moby (docker CLI).', source: S.rancherDesktop },

  { id: 'f-h-borg', topic: 'history', front: 'Borg', back: 'Google’s internal cluster manager and the predecessor of Kubernetes.', source: S.borgBlog },
  { id: 'f-h-name', topic: 'history', front: 'Meaning of "Kubernetes"', back: 'Greek for helmsman or pilot. K8s = K + 8 letters + s.', source: S.overview },
  { id: 'f-h-dates', topic: 'history', front: 'Key dates', back: 'June 2014: open-sourced · July 2015: v1.0 + CNCF founded · March 2018: first CNCF graduate.', source: S.history },
  { id: 'f-h-seven', topic: 'history', front: 'Project Seven', back: 'Kubernetes’ original codename (after Seven of Nine) — hence the seven-spoke logo.', source: S.history },
  { id: 'f-h-dockershim', topic: 'history', front: 'dockershim timeline', back: 'Deprecated in v1.20 (Dec 2020), removed in v1.24 (May 2022).', source: S.dockershimFaq },
  { id: 'f-h-psp', topic: 'history', front: 'PodSecurityPolicy', back: 'Deprecated in v1.21, removed in v1.25. Replaced by Pod Security Admission.', source: S.pspDeprecation },
];
