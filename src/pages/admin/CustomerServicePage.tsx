import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useProducts } from "@/lib/products-context-hooks";
import { Send, Volume2, VolumeX, Headset, Circle, ImagePlus, Trash2, Store, User, Search, RefreshCw, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadChatImage, encodeImageAttachment, parseImageAttachment } from "@/lib/chat-image-upload";
import { toast } from "sonner";
import { playNotificationSound, startTabFlash } from "@/hooks/use-notifications";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminAccess } from "@/hooks/use-admin-access";
import { useUnifiedResellers } from "@/lib/unified-hooks";

interface UnifiedSession {
  id: string;
  type: "support" | "reseller";
  title: string;
  subtitle?: string;
  avatar?: string;
  is_online: boolean;
  last_message_at: string;
  reseller_id?: string;
  customer_id?: string;
}

interface UnifiedMessage {
  id: string;
  session_id: string;
  sender: string;
  message: string;
  attachment_product_id?: string | null;
  is_read: boolean;
  created_at: string;
}

const DEFAULT_SESSIONS: UnifiedSession[] = [
  {
    id: "cs-session-1",
    type: "support",
    title: "Eleanor Vance",
    subtitle: "Storefront Customer Inquiry",
    is_online: true,
    last_message_at: new Date(Date.now() - 60000 * 15).toISOString(),
    customer_id: "cust-101"
  },
  {
    id: "cs-session-2",
    type: "reseller",
    title: "Apex Retailers (Ahmad Fauzi)",
    subtitle: "VIP Tier & Order Processing",
    is_online: true,
    last_message_at: new Date(Date.now() - 60000 * 45).toISOString(),
    reseller_id: "reseller-apex-01"
  },
  {
    id: "cs-session-3",
    type: "reseller",
    title: "Global Vogue (Maria Santos)",
    subtitle: "Payout & USDT Deposit Confirmation",
    is_online: false,
    last_message_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    reseller_id: "reseller-vogue-02"
  }
];

const DEFAULT_SESSION_MESSAGES: Record<string, UnifiedMessage[]> = {
  "cs-session-1": [
    {
      id: "msg-1-1",
      session_id: "cs-session-1",
      sender: "customer",
      message: "Hello! I have a question regarding international shipping delivery time for the noise cancelling headphones.",
      is_read: true,
      created_at: new Date(Date.now() - 60000 * 25).toISOString()
    },
    {
      id: "msg-1-2",
      session_id: "cs-session-1",
      sender: "support",
      message: "Hi Eleanor! Standard express shipping takes 3-5 business days with live parcel tracking provided.",
      is_read: true,
      created_at: new Date(Date.now() - 60000 * 18).toISOString()
    },
    {
      id: "msg-1-3",
      session_id: "cs-session-1",
      sender: "customer",
      message: "Great, thank you! I just placed my order.",
      is_read: true,
      created_at: new Date(Date.now() - 60000 * 15).toISOString()
    }
  ],
  "cs-session-2": [
    {
      id: "msg-2-1",
      session_id: "cs-session-2",
      sender: "reseller",
      message: "Hi Admin team, my store just crossed 100 successful orders! Could you review our tier upgrade to VIP-3?",
      is_read: true,
      created_at: new Date(Date.now() - 60000 * 50).toISOString()
    },
    {
      id: "msg-2-2",
      session_id: "cs-session-2",
      sender: "support",
      message: "Congratulations Ahmad! Your store metrics qualify for VIP-3. We have activated your increased profit margin and expanded product catalogue limit.",
      is_read: true,
      created_at: new Date(Date.now() - 60000 * 45).toISOString()
    }
  ],
  "cs-session-3": [
    {
      id: "msg-3-1",
      session_id: "cs-session-3",
      sender: "reseller",
      message: "Good afternoon. I submitted a deposit request for $10,000 via wire transfer with the transfer receipt attached.",
      is_read: true,
      created_at: new Date(Date.now() - 3600000 * 3).toISOString()
    },
    {
      id: "msg-3-2",
      session_id: "cs-session-3",
      sender: "support",
      message: "Thank you Maria. Our finance department has verified the bank slip and credited $10,000 to your active store balance.",
      is_read: true,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  ]
};

export default function CustomerServicePage() {
  const [sessions, setSessions] = useState<UnifiedSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<UnifiedMessage[]>([]);
  const [input, setInput] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [sessionFilter, setSessionFilter] = useState<"all" | "reseller" | "support">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { products } = useProducts();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch all support and reseller sessions
  const fetchAllSessions = useCallback(async () => {
    try {
      let supportData: any[] = [];
      let resellerData: any[] = [];
      try {
        const res = await supabase.from('support_sessions').select('*').order('last_message_at', { ascending: false }).limit(100);
        if (res?.data) supportData = res.data;
      } catch (e) {
        console.warn("Error fetching support sessions:", e);
      }
      try {
        const res = await supabase.from('reseller_chat_sessions').select('*').order('last_message_at', { ascending: false }).limit(100);
        if (res?.data) resellerData = res.data;
      } catch (e) {
        console.warn("Error fetching reseller sessions:", e);
      }

      const supportList: UnifiedSession[] = supportData.map((s: any) => ({
        id: s.id,
        type: "support",
        title: s.customer_name || "Storefront Customer",
        subtitle: "Customer Support",
        is_online: s.is_online === true,
        last_message_at: s.last_message_at || s.created_at || new Date().toISOString()
      }));

      const resellerList: UnifiedSession[] = resellerData.map((s: any) => {
        const isCustomerToReseller = !!s.customer_id;
        const title = isCustomerToReseller 
          ? `${s.customer_name || "Customer"} ↔ ${s.reseller_name || "Reseller"}`
          : (s.reseller_name || s.shop_name || `Reseller GRS-${String(s.reseller_id || '').slice(0, 6)}`);
        
        return {
          id: s.id,
          type: "reseller",
          title,
          subtitle: isCustomerToReseller ? "Virtual Client" : "Reseller Support",
          is_online: s.is_online === true,
          last_message_at: s.last_message_at || s.created_at || new Date().toISOString(),
          reseller_id: s.reseller_id,
          customer_id: s.customer_id
        };
      });

      const combined = [...supportList, ...resellerList].sort((a, b) => {
        return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
      });

      if (combined.length === 0) {
        setSessions(DEFAULT_SESSIONS);
        setActiveSessionId((prev) => prev || DEFAULT_SESSIONS[0].id);
      } else {
        setSessions(combined);
        setActiveSessionId((prev) => prev || combined[0].id);
      }
    } catch (e) {
      console.error("Error fetching sessions, using default fallback:", e);
      setSessions(DEFAULT_SESSIONS);
      setActiveSessionId((prev) => prev || DEFAULT_SESSIONS[0].id);
    }
  }, []);

  useEffect(() => {
    fetchAllSessions();

    const ch1 = supabase.channel('cs_support_sessions').on('postgres_changes', { event: '*', schema: 'public', table: 'support_sessions' }, fetchAllSessions).subscribe();
    const ch2 = supabase.channel('cs_reseller_sessions').on('postgres_changes', { event: '*', schema: 'public', table: 'reseller_chat_sessions' }, fetchAllSessions).subscribe();

    return () => {
      supabase.removeChannel(ch1);
      supabase.removeChannel(ch2);
    };
  }, [fetchAllSessions]);

  const activeSession = useMemo(() => sessions.find((s) => s.id === activeSessionId), [sessions, activeSessionId]);

  // Fetch full message history for active session
  useEffect(() => {
    if (!activeSessionId || !activeSession) {
      setMessages([]);
      return;
    }

    const table = activeSession.type === "reseller" ? "reseller_chat_messages" : "support_messages";

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('session_id', activeSessionId)
          .order('created_at', { ascending: true })
          .limit(200);

        if (!error && data && data.length > 0) {
          const mapped = data.map((m: any) => ({
            id: m.id,
            session_id: m.session_id,
            sender: m.sender || "unknown",
            message: m.content || m.message || "",
            attachment_product_id: m.attachment_product_id,
            is_read: m.is_read ?? true,
            created_at: m.created_at || new Date().toISOString()
          }));
          setMessages(mapped);
        } else if (DEFAULT_SESSION_MESSAGES[activeSessionId]) {
          setMessages(DEFAULT_SESSION_MESSAGES[activeSessionId]);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
        if (DEFAULT_SESSION_MESSAGES[activeSessionId]) {
          setMessages(DEFAULT_SESSION_MESSAGES[activeSessionId]);
        }
      }
    };

    fetchMessages();

    const channel = supabase
      .channel(`cs_messages_${activeSessionId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: table,
        filter: `session_id=eq.${activeSessionId}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newMsg = payload.new as any;
          if (newMsg.sender !== "support" && !newMsg.is_read) {
            if (soundEnabled) playNotificationSound();
            if (document.hidden) startTabFlash();
          }
        }
        fetchMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeSessionId, activeSession?.type, soundEnabled]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark unread messages
  useEffect(() => {
    if (!activeSessionId || !activeSession || messages.length === 0) return;
    const table = activeSession.type === "reseller" ? "reseller_chat_messages" : "support_messages";
    const unread = messages.filter((m) => m.sender !== "support" && !m.is_read);
    
    if (unread.length > 0) {
      const markAsRead = async () => {
        for (const msg of unread) {
          await supabase.from(table).update({ is_read: true }).eq('id', msg.id);
        }
      };
      markAsRead().catch(console.error);
    }
  }, [activeSessionId, activeSession?.type, messages]);

  const handleSend = async () => {
    if (!input.trim() || !activeSessionId || !activeSession) return;
    const msg = input.trim();
    setInput("");
    
    const table = activeSession.type === "reseller" ? "reseller_chat_messages" : "support_messages";
    const sessionTable = activeSession.type === "reseller" ? "reseller_chat_sessions" : "support_sessions";

    try {
      await supabase.from(table).insert({
        session_id: activeSessionId,
        sender: "support",
        content: msg,
        is_read: false,
        created_at: new Date().toISOString()
      });
      
      await supabase.from(sessionTable).update({
        last_message_at: new Date().toISOString()
      }).eq('id', activeSessionId);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeSessionId || !activeSession) return;
    
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setUploading(true);
    const table = activeSession.type === "reseller" ? "reseller_chat_messages" : "support_messages";
    const sessionTable = activeSession.type === "reseller" ? "reseller_chat_sessions" : "support_sessions";

    try {
      const url = await uploadChatImage(file);
      if (url) {
        await supabase.from(table).insert({
          session_id: activeSessionId,
          sender: "support",
          content: encodeImageAttachment(url, input.trim()),
          is_read: false,
          created_at: new Date().toISOString()
        });
        
        await supabase.from(sessionTable).update({
          last_message_at: new Date().toISOString()
        }).eq('id', activeSessionId);
        
        setInput("");
        toast.success("Image sent");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!activeSession) return;
    const table = activeSession.type === "reseller" ? "reseller_chat_messages" : "support_messages";
    try {
      await supabase.from(table).delete().eq('id', messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
      toast.success("Message deleted");
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    }
  };

  const { canSeeAll, hasAccessToReseller } = useAdminAccess();
  const unifiedResellers = useUnifiedResellers();

  const allowedResellerIds = useMemo(() => {
    if (canSeeAll) return null;
    const ids = new Set<string>();
    unifiedResellers.filter(r => hasAccessToReseller(r)).forEach(r => {
      ids.add(String(r.id));
      if (r.resellerId) {
        ids.add(String(r.resellerId));
        ids.add(`GRS${r.resellerId}`);
      }
    });
    return ids;
  }, [canSeeAll, hasAccessToReseller, unifiedResellers]);

  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      if (!canSeeAll && s.type === "reseller" && s.reseller_id) {
        const reseller = unifiedResellers.find(r => r.id === s.reseller_id || String(r.resellerId) === s.reseller_id);
        if (reseller && hasAccessToReseller(reseller)) {
          // allowed
        } else if (allowedResellerIds && !allowedResellerIds.has(String(s.reseller_id))) {
          return false;
        }
      }
      if (sessionFilter !== "all" && s.type !== sessionFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return s.title.toLowerCase().includes(q) || (s.subtitle && s.subtitle.toLowerCase().includes(q));
      }
      return true;
    });
  }, [sessions, sessionFilter, searchQuery, canSeeAll, allowedResellerIds, unifiedResellers, hasAccessToReseller]);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Headset className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Customer Service & Reseller Chat</h1>
            <p className="text-xs text-muted-foreground">Unified messaging portal & complete chat histories</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchAllSessions} className="gap-1.5 h-8 text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="h-8 w-8"
            title={soundEnabled ? "Mute notifications" : "Unmute notifications"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Sessions List */}
        <div className="w-80 border-r border-border flex flex-col bg-card shrink-0">
          <div className="p-3 border-b border-border space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-xs bg-muted/50"
              />
            </div>
            <Tabs value={sessionFilter} onValueChange={(v) => setSessionFilter(v as any)} className="w-full">
              <TabsList className="grid grid-cols-3 w-full h-8 text-xs">
                <TabsTrigger value="all" className="text-[11px] py-1">All ({sessions.length})</TabsTrigger>
                <TabsTrigger value="reseller" className="text-[11px] py-1">Resellers</TabsTrigger>
                <TabsTrigger value="support" className="text-[11px] py-1">Customers</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {filteredSessions.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No active conversations found
              </div>
            ) : (
              filteredSessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSessionId(s.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 text-left transition-colors hover:bg-accent/50 relative",
                    activeSessionId === s.id && "bg-primary/10 border-l-4 border-primary"
                  )}
                >
                  <div className="relative shrink-0">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs",
                      s.type === "reseller" ? "bg-amber-500/10 text-amber-500" : "bg-primary/10 text-primary"
                    )}>
                      {s.type === "reseller" ? <Store className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </div>
                    <Circle className={cn(
                      "absolute -bottom-0.5 -right-0.5 h-3 w-3",
                      s.is_online ? "fill-emerald-500 text-emerald-500" : "fill-muted text-muted-foreground"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-xs font-semibold text-foreground truncate">{s.title}</p>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {new Date(s.last_message_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className={cn(
                        "text-[9px] px-1.5 py-0 h-4 border",
                        s.type === "reseller" ? "border-amber-500/30 text-amber-500 bg-amber-500/5" : "border-primary/30 text-primary bg-primary/5"
                      )}>
                        {s.subtitle || (s.type === "reseller" ? "Reseller" : "Customer")}
                      </Badge>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Active Chat Area */}
        <div className="flex-1 flex flex-col bg-background overflow-hidden">
          {activeSession ? (
            <>
              {/* Chat Session Header */}
              <div className="p-3 px-5 border-b border-border bg-card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs",
                    activeSession.type === "reseller" ? "bg-amber-500/10 text-amber-500" : "bg-primary/10 text-primary"
                  )}>
                    {activeSession.type === "reseller" ? <Store className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-foreground">{activeSession.title}</h2>
                      <Badge variant="secondary" className="text-[10px] h-4">
                        {activeSession.type === "reseller" ? "Reseller Chat" : "Direct Customer"}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Session ID: <span className="font-mono">{activeSession.id.slice(0, 12)}…</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Message Feed */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                    No messages in this chat session yet.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isSupport = msg.sender === "support";
                    const { imageUrl, text } = parseImageAttachment(msg.message);

                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex flex-col group max-w-[75%]",
                          isSupport ? "ml-auto items-end" : "mr-auto items-start"
                        )}
                      >
                        <div
                          className={cn(
                            "rounded-2xl px-3.5 py-2.5 text-xs relative",
                            isSupport
                              ? "bg-primary text-primary-foreground rounded-br-none shadow-sm"
                              : "bg-card text-foreground border border-border rounded-bl-none shadow-sm"
                          )}
                        >
                          {imageUrl && (
                            <img
                              src={imageUrl}
                              alt="Attachment"
                              className="rounded-lg max-h-52 object-cover mb-2 border border-black/10"
                            />
                          )}
                          {text && <p className="whitespace-pre-wrap break-words">{text}</p>}

                          <div className={cn(
                            "flex items-center justify-end gap-1.5 mt-1 text-[9px] opacity-75",
                            isSupport ? "text-primary-foreground/80" : "text-muted-foreground"
                          )}>
                            <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 hover:text-destructive"
                              title="Delete message"
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input Area */}
              <div className="p-3 border-t border-border bg-card">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
                    title="Send image"
                  >
                    <ImagePlus className="h-4 w-4" />
                  </Button>

                  <Input
                    placeholder="Type your reply as Admin Support..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 h-9 text-xs bg-muted/40 border-border focus-visible:ring-1 focus-visible:ring-primary"
                  />

                  <Button
                    type="submit"
                    size="sm"
                    disabled={!input.trim()}
                    className="h-9 px-3 gap-1 text-xs shrink-0"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Send
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
              <Headset className="h-12 w-12 stroke-[1.5] mb-3 text-muted-foreground/50" />
              <h3 className="text-sm font-semibold text-foreground">Select a Conversation</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Choose a customer or reseller from the left sidebar to view their full conversation history and respond in real-time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
