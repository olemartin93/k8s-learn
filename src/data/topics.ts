import type { Topic, TopicId } from './types';

export const topics: readonly Topic[] = [
  {
    id: 'basics',
    name: 'Kubernetes Basics',
    tag: 'Basics',
    emoji: '🧭',
    description: 'What Kubernetes is, why it exists and the core vocabulary.',
    chipClass: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200',
  },
  {
    id: 'architecture',
    name: 'Architecture',
    tag: 'Architecture',
    emoji: '🏛️',
    description: 'Control plane, nodes and how the components talk to each other.',
    chipClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200',
  },
  {
    id: 'workloads',
    name: 'Workloads',
    tag: 'Workloads',
    emoji: '📦',
    description: 'Pods, Deployments, StatefulSets, DaemonSets, Jobs and CronJobs.',
    chipClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200',
  },
  {
    id: 'networking',
    name: 'Networking',
    tag: 'Networking',
    emoji: '🌐',
    description: 'Services, DNS, Ingress, Gateway API and NetworkPolicies.',
    chipClass: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-200',
  },
  {
    id: 'storage',
    name: 'Storage',
    tag: 'Storage',
    emoji: '💾',
    description: 'Volumes, PersistentVolumes, PersistentVolumeClaims and StorageClasses.',
    chipClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200',
  },
  {
    id: 'config',
    name: 'Configuration',
    tag: 'Config',
    emoji: '⚙️',
    description: 'ConfigMaps, Secrets, resources, probes and labels.',
    chipClass: 'bg-lime-100 text-lime-800 dark:bg-lime-900/60 dark:text-lime-200',
  },
  {
    id: 'security',
    name: 'Security',
    tag: 'Security',
    emoji: '🔐',
    description: 'RBAC, ServiceAccounts and Pod Security Standards.',
    chipClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200',
  },
  {
    id: 'scheduling',
    name: 'Scheduling & Scaling',
    tag: 'Scheduling',
    emoji: '🗓️',
    description: 'How Pods land on nodes, taints, affinity and autoscaling.',
    chipClass: 'bg-violet-100 text-violet-800 dark:bg-violet-900/60 dark:text-violet-200',
  },
  {
    id: 'kubectl',
    name: 'kubectl',
    tag: 'kubectl',
    emoji: '⌨️',
    description: 'The everyday commands you will type the most.',
    chipClass: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100',
  },
  {
    id: 'ecosystem',
    name: 'Ecosystem',
    tag: 'Ecosystem',
    emoji: '🧩',
    description: 'Helm, CRDs, Operators, container runtimes and local clusters.',
    chipClass: 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200',
  },
  {
    id: 'docker-desktop',
    name: 'Docker Desktop',
    tag: 'Docker Desktop',
    emoji: '🐳',
    description: 'Running Kubernetes locally with Docker Desktop.',
    chipClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200',
  },
  {
    id: 'rancher',
    name: 'Rancher & SUSE',
    tag: 'Rancher',
    emoji: '🐮',
    description: 'Rancher Manager, K3s, RKE2, Fleet and Rancher Desktop.',
    chipClass: 'bg-sky-200 text-sky-900 dark:bg-sky-800/70 dark:text-sky-100',
  },
  {
    id: 'history',
    name: 'History',
    tag: 'History',
    emoji: '📜',
    description: 'From Google Borg to the CNCF and today.',
    chipClass: 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-200',
  },
];

const topicMap = new Map<TopicId, Topic>(topics.map((t) => [t.id, t]));

export function getTopic(id: TopicId): Topic {
  const topic = topicMap.get(id);
  if (!topic) throw new Error(`Unknown topic: ${id}`);
  return topic;
}
