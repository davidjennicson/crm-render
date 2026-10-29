import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Play, Pause, Trash2, Zap, Clock, GitBranch, Sparkles, Mail, X } from "lucide-react";
import { AppLayout } from "@/AppLayout";
import type { WorkflowNode, WorkflowConnection, Workflow } from "@/types/crm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const nodeTypes = [
  { type: "trigger" as const, label: "Trigger", icon: Zap, color: "bg-primary/10 text-primary border-primary/20" },
  { type: "action" as const, label: "Action", icon: Mail, color: "bg-success/10 text-success border-success/20" },
  { type: "condition" as const, label: "Condition", icon: GitBranch, color: "bg-warning/10 text-warning border-warning/20" },
  { type: "delay" as const, label: "Delay", icon: Clock, color: "bg-muted text-muted-foreground border-border" },
  { type: "ai" as const, label: "AI Step", icon: Sparkles, color: "bg-primary/10 text-primary border-primary/20" },
];

const sampleWorkflows: Workflow[] = [
  {
    id: "wf1",
    name: "New Lead Follow-up",
    description: "Automatically send welcome email when a new lead is created",
    active: true,
    lastEdited: "2h ago",
    nodes: [
      { id: "n1", type: "trigger", title: "New Contact Created", description: "When a lead is added", x: 100, y: 200 },
      { id: "n2", type: "delay", title: "Wait 5 minutes", description: "Brief delay", x: 350, y: 200 },
      { id: "n3", type: "ai", title: "Generate Email", description: "AI drafts welcome email", x: 600, y: 200 },
      { id: "n4", type: "action", title: "Send Email", description: "Deliver via SMTP", x: 850, y: 200 },
    ],
    connections: [
      { id: "c1", from: "n1", to: "n2" },
      { id: "c2", from: "n2", to: "n3" },
      { id: "c3", from: "n3", to: "n4" },
    ],
  },
  {
    id: "wf2",
    name: "Deal Stage Notification",
    description: "Notify team when a deal moves to negotiation",
    active: false,
    lastEdited: "1d ago",
    nodes: [
      { id: "n1", type: "trigger", title: "Deal Stage Changed", description: "When deal moves", x: 100, y: 200 },
      { id: "n2", type: "condition", title: "Is Negotiation?", description: "Check stage", x: 350, y: 200 },
      { id: "n3", type: "action", title: "Send Slack Message", description: "Notify #deals channel", x: 600, y: 200 },
    ],
    connections: [
      { id: "c1", from: "n1", to: "n2" },
      { id: "c2", from: "n2", to: "n3" },
    ],
  },
];

const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;

function WorkflowEditor({ workflow, onUpdate, onClose }: { workflow: Workflow; onUpdate: (wf: Workflow) => void; onClose: () => void }) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<WorkflowNode[]>(workflow.nodes);
  const [connections, setConnections] = useState<WorkflowConnection[]>(workflow.connections);
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);

  useEffect(() => {
    onUpdate({ ...workflow, nodes, connections });
  }, [nodes, connections]);

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    e.stopPropagation();
    setDragging({ id: nodeId, offsetX: e.clientX - node.x, offsetY: e.clientY - node.y });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setNodes(prev => prev.map(n =>
      n.id === dragging.id ? { ...n, x: e.clientX - dragging.offsetX, y: e.clientY - dragging.offsetY } : n
    ));
  }, [dragging]);

  const handleMouseUp = () => setDragging(null);

  const handleConnectionStart = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setConnecting(nodeId);
  };

  const handleConnectionEnd = (nodeId: string) => {
    if (connecting && connecting !== nodeId && !connections.find(c => c.from === connecting && c.to === nodeId)) {
      setConnections(prev => [...prev, { id: crypto.randomUUID(), from: connecting, to: nodeId }]);
    }
    setConnecting(null);
  };

  const addNode = (type: WorkflowNode["type"]) => {
    const newNode: WorkflowNode = {
      id: crypto.randomUUID(),
      type,
      title: nodeTypes.find(t => t.type === type)!.label,
      description: "Configure this step",
      x: 200 + Math.random() * 300,
      y: 150 + Math.random() * 200,
    };
    setNodes(prev => [...prev, newNode]);
  };

  const deleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setConnections(prev => prev.filter(c => c.from !== id && c.to !== id));
    setSelectedNode(null);
  };

  const getNodeConfig = (type: WorkflowNode["type"]) => nodeTypes.find(t => t.type === type)!;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-card border border-border rounded-xl mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold text-foreground">{workflow.name}</span>
          <span className="text-[12px] text-muted-foreground">— drag nodes to reposition, click output ports to connect</span>
        </div>
        <div className="flex items-center gap-2">
          {nodeTypes.map(nt => (
            <button
              key={nt.type}
              onClick={() => addNode(nt.type)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-colors hover:opacity-80 ${nt.color}`}
            >
              <nt.icon className="w-3 h-3" />
              {nt.label}
            </button>
          ))}
          <div className="w-px h-6 bg-border mx-1" />
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 bg-muted/30 rounded-xl border border-border relative overflow-hidden"
        style={{ backgroundImage: "radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* SVG connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          {connections.map(conn => {
            const from = nodes.find(n => n.id === conn.from);
            const to = nodes.find(n => n.id === conn.to);
            if (!from || !to) return null;
            const x1 = from.x + NODE_WIDTH;
            const y1 = from.y + NODE_HEIGHT / 2;
            const x2 = to.x;
            const y2 = to.y + NODE_HEIGHT / 2;
            const cx = (x1 + x2) / 2;
            return (
              <path
                key={conn.id}
                d={`M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeDasharray={connecting ? "6 3" : "none"}
                opacity={0.5}
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map(node => {
          const config = getNodeConfig(node.type);
          const Icon = config.icon;
          return (
            <motion.div
              key={node.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`absolute bg-card rounded-xl border shadow-apple-sm hover:shadow-apple-md transition-shadow cursor-grab active:cursor-grabbing select-none ${selectedNode?.id === node.id ? "ring-2 ring-primary" : "border-border"}`}
              style={{ left: node.x, top: node.y, width: NODE_WIDTH, zIndex: dragging?.id === node.id ? 50 : 10 }}
              onMouseDown={e => handleMouseDown(e, node.id)}
              onClick={e => { e.stopPropagation(); setSelectedNode(node); }}
            >
              <div className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center ${config.color}`}>
                    <Icon className="w-3 h-3" />
                  </div>
                  <span className="text-[12px] font-semibold text-foreground truncate flex-1">{node.title}</span>
                  <button
                    onClick={e => { e.stopPropagation(); deleteNode(node.id); }}
                    className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                  >
                    <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground truncate">{node.description}</p>
              </div>
              {/* Input port */}
              <div
                className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-card border-2 border-border hover:border-primary transition-colors cursor-pointer z-20"
                onClick={e => { e.stopPropagation(); handleConnectionEnd(node.id); }}
              />
              {/* Output port */}
              <div
                className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-card border-2 border-primary cursor-pointer z-20 hover:bg-primary/20 transition-colors"
                onMouseDown={e => handleConnectionStart(e, node.id)}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Node properties panel */}
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 bg-card rounded-xl border border-border p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[14px] font-semibold text-foreground">Node Properties</h3>
            <button onClick={() => setSelectedNode(null)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Title</Label>
              <Input
                value={selectedNode.title}
                onChange={e => {
                  const val = e.target.value;
                  setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, title: val } : n));
                  setSelectedNode(prev => prev ? { ...prev, title: val } : null);
                }}
                className="rounded-lg bg-muted border-border text-[12px] h-8"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Description</Label>
              <Input
                value={selectedNode.description}
                onChange={e => {
                  const val = e.target.value;
                  setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, description: val } : n));
                  setSelectedNode(prev => prev ? { ...prev, description: val } : null);
                }}
                className="rounded-lg bg-muted border-border text-[12px] h-8"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Type</Label>
              <div className="text-[12px] text-foreground bg-muted rounded-lg px-3 py-1.5 border border-border capitalize">{selectedNode.type}</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

const Workflows = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>(sampleWorkflows);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const createWorkflow = () => {
    if (!newName.trim()) return;
    const wf: Workflow = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      description: newDesc.trim(),
      nodes: [],
      connections: [],
      active: false,
      lastEdited: "now",
    };
    setWorkflows(prev => [...prev, wf]);
    setEditingWorkflow(wf);
    setNameDialogOpen(false);
    setNewName("");
    setNewDesc("");
  };

  const toggleActive = (id: string) => {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, active: !w.active } : w));
  };

  const deleteWorkflow = (id: string) => {
    setWorkflows(prev => prev.filter(w => w.id !== id));
  };

  if (editingWorkflow) {
    return (
      <AppLayout>
        <div className="px-8 py-6 h-full">
          <WorkflowEditor
            workflow={editingWorkflow}
            onUpdate={wf => {
              setEditingWorkflow(wf);
              setWorkflows(prev => prev.map(w => w.id === wf.id ? wf : w));
            }}
            onClose={() => setEditingWorkflow(null)}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-[1000px] mx-auto px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight text-foreground">Workflows</h1>
            <p className="text-[15px] text-muted-foreground mt-1">Automate your CRM with visual workflows</p>
          </div>
          <button
            onClick={() => setNameDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-[13px] font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            New Workflow
          </button>
        </motion.div>

        <div className="space-y-3">
          {workflows.map((wf, i) => (
            <motion.div
              key={wf.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-card rounded-2xl p-5 shadow-apple-sm border border-border hover:shadow-apple-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer" onClick={() => setEditingWorkflow(wf)}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${wf.active ? "bg-success/10" : "bg-muted"}`}>
                    <Zap className={`w-5 h-5 ${wf.active ? "text-success" : "text-muted-foreground"}`} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[14px] font-semibold text-foreground">{wf.name}</h3>
                    <p className="text-[12px] text-muted-foreground truncate">{wf.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-muted-foreground">{wf.nodes.length} nodes</span>
                  <span className="text-[11px] text-muted-foreground">{wf.lastEdited}</span>
                  <button
                    onClick={() => toggleActive(wf.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                      wf.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {wf.active ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                    {wf.active ? "Active" : "Paused"}
                  </button>
                  <button onClick={() => setEditingWorkflow(wf)} className="px-3 py-1.5 rounded-lg bg-muted text-[11px] font-medium text-foreground hover:bg-accent transition-colors">
                    Edit
                  </button>
                  <button onClick={() => deleteWorkflow(wf.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <Dialog open={nameDialogOpen} onOpenChange={setNameDialogOpen}>
          <DialogContent className="sm:max-w-[420px] bg-card border-border rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-[18px] font-semibold text-foreground">New Workflow</DialogTitle>
            </DialogHeader>
            <form onSubmit={e => { e.preventDefault(); createWorkflow(); }} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label className="text-[13px] text-muted-foreground">Name</Label>
                <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Lead Follow-up" className="rounded-xl bg-muted border-border text-[13px]" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px] text-muted-foreground">Description</Label>
                <Input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="What does this workflow do?" className="rounded-xl bg-muted border-border text-[13px]" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setNameDialogOpen(false)} className="px-4 py-2 rounded-xl text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-[13px] font-medium hover:opacity-90 transition-opacity">Create & Edit</button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Workflows;
