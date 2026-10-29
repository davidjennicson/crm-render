import { useState } from "react";
import { AppLayout } from "@/AppLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Send } from "lucide-react";

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  initials: string;
}

interface Message {
  id: string;
  sender: string;
  initials: string;
  text: string;
  timestamp: string;
  isMine: boolean;
}

const CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    name: "Alice Johnson",
    lastMessage: "Sure, I'll send over the contract details by EOD.",
    timestamp: "10:42 AM",
    unread: 2,
    initials: "AJ",
  },
  {
    id: "2",
    name: "Bob Martinez",
    lastMessage: "Can we reschedule the demo to Thursday?",
    timestamp: "9:15 AM",
    unread: 1,
    initials: "BM",
  },
  {
    id: "3",
    name: "Clara Nguyen",
    lastMessage: "Thanks for the follow-up! Looking forward to it.",
    timestamp: "Yesterday",
    unread: 0,
    initials: "CN",
  },
  {
    id: "4",
    name: "David Kim",
    lastMessage: "The proposal looks good. Minor tweaks needed on pricing.",
    timestamp: "Yesterday",
    unread: 0,
    initials: "DK",
  },
  {
    id: "5",
    name: "Emma Patel",
    lastMessage: "We're ready to move forward with the enterprise plan.",
    timestamp: "Mon",
    unread: 0,
    initials: "EP",
  },
];

const THREAD: Message[] = [
  {
    id: "m1",
    sender: "Alice Johnson",
    initials: "AJ",
    text: "Hi! I wanted to follow up on the proposal we discussed last week.",
    timestamp: "10:01 AM",
    isMine: false,
  },
  {
    id: "m2",
    sender: "You",
    initials: "ME",
    text: "Of course! I've been working on the pricing details. Should have something ready for you soon.",
    timestamp: "10:05 AM",
    isMine: true,
  },
  {
    id: "m3",
    sender: "Alice Johnson",
    initials: "AJ",
    text: "Great. Our team is especially interested in the enterprise tier. Can you include a breakdown of the onboarding support?",
    timestamp: "10:12 AM",
    isMine: false,
  },
  {
    id: "m4",
    sender: "You",
    initials: "ME",
    text: "Absolutely. I'll add a dedicated onboarding section covering the first 90 days.",
    timestamp: "10:18 AM",
    isMine: true,
  },
  {
    id: "m5",
    sender: "Alice Johnson",
    initials: "AJ",
    text: "Perfect. Also, could you loop in our legal team for the contract review?",
    timestamp: "10:35 AM",
    isMine: false,
  },
  {
    id: "m6",
    sender: "Alice Johnson",
    initials: "AJ",
    text: "Sure, I'll send over the contract details by EOD.",
    timestamp: "10:42 AM",
    isMine: false,
  },
];

export default function Messages() {
  const [activeId, setActiveId] = useState<string>("1");

  const active = CONVERSATIONS.find((c) => c.id === activeId) ?? CONVERSATIONS[0];

  return (
    <AppLayout>
      <div className="max-w-[1100px] mx-auto px-6 py-6 h-[calc(100vh-56px)] md:h-screen flex flex-col">
        <h1 className="text-2xl font-semibold text-foreground mb-4">Messages</h1>

        <div className="flex flex-1 gap-4 overflow-hidden rounded-xl border border-border bg-card">
          {/* Conversation list */}
          <div className="w-72 shrink-0 border-r border-border flex flex-col">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Conversations
              </p>
            </div>
            <ScrollArea className="flex-1">
              <ul>
                {CONVERSATIONS.map((conv) => (
                  <li key={conv.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(conv.id)}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors ${
                        activeId === conv.id ? "bg-muted/50" : ""
                      }`}
                    >
                      <Avatar className="h-9 w-9 shrink-0 mt-0.5">
                        <AvatarFallback className="text-xs font-semibold">
                          {conv.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-sm font-medium text-foreground truncate">
                            {conv.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {conv.timestamp}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1 mt-0.5">
                          <p className="text-xs text-muted-foreground truncate">
                            {conv.lastMessage}
                          </p>
                          {conv.unread > 0 && (
                            <Badge className="h-4 min-w-[1rem] px-1 text-[10px] shrink-0">
                              {conv.unread}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>

          {/* Message area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Thread header */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-border">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs font-semibold">
                  {active.initials}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-foreground">{active.name}</span>
            </div>

            {/* Thread messages */}
            <ScrollArea className="flex-1 px-5 py-4">
              <div className="space-y-4">
                {THREAD.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${msg.isMine ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {!msg.isMine && (
                      <Avatar className="h-7 w-7 shrink-0">
                        <AvatarFallback className="text-[10px] font-semibold">
                          {msg.initials}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.isMine
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 mb-1">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Reply input (disabled) */}
            <div className="px-5 py-3 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center rounded-lg border border-border bg-muted/40 px-4 py-2.5">
                  <MessageSquare className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    Messaging backend not yet connected
                  </span>
                </div>
                <Button size="sm" disabled>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
