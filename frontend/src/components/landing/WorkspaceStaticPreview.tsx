"use client";

import React, { useState } from "react";
import { 
  MessageSquare, 
  LayoutDashboard, 
  Users, 
  QrCode, 
  Settings, 
  Search, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ShieldCheck,
  Send,
  Building2,
  PhoneCall
} from "lucide-react";

export const WorkspaceStaticPreview = () => {
  const [selectedConv, setSelectedConv] = useState(0);

  const conversations = [
    {
      id: "conv-1",
      name: "Mavoungou Jean-Luc",
      channel: "WhatsApp",
      channelColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      subject: "Panne détection réseau routeur 4G",
      preview: "Le routeur reçu à Pointe-Noire ne capte aucun signal...",
      time: "Il y a 8 min",
      status: "En cours",
      statusColor: "bg-amber-50 text-amber-700 border-amber-200",
      agent: "Jean-Pierre M.",
      ticketRef: "SAV-420",
      city: "Pointe-Noire",
      messages: [
        {
          from: "client",
          text: "Bonjour, j'ai récupéré mon routeur 4G ce matin à l'agence de Pointe-Noire mais le voyant réseau clignote en rouge.",
          time: "09:42"
        },
        {
          from: "agent",
          text: "Bonjour M. Mavoungou. Votre dossier #SAV-420 est ouvert. Notre équipe technique vérifie actuellement l'activation de votre ligne.",
          time: "09:45"
        }
      ]
    },
    {
      id: "conv-2",
      name: "Clinique Dr Samba",
      channel: "Guichet",
      channelColor: "bg-sky-50 text-sky-700 border-sky-200",
      subject: "Demande duplicata bon de prise en charge",
      preview: "Document requis pour l'assurance avant 14h...",
      time: "Il y a 22 min",
      status: "Nouveau",
      statusColor: "bg-blue-50 text-blue-700 border-blue-200",
      agent: "Sarah B.",
      ticketRef: "SAV-421",
      city: "Brazzaville",
      messages: [
        {
          from: "client",
          text: "Bonjour, le patient souhaite récupérer son duplicata de prise en charge pour son dossier mutuelle.",
          time: "09:28"
        },
        {
          from: "agent",
          text: "Bonjour, duplicata édité et archivé au dossier. L'agent d'accueil peut le remettre au guichet.",
          time: "09:31"
        }
      ]
    },
    {
      id: "conv-3",
      name: "Distrib Express Congo",
      channel: "WhatsApp",
      channelColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      subject: "Confirmation de livraison colis #884",
      preview: "Colis bien réceptionné à l'entrepôt, merci !",
      time: "Il y a 1h",
      status: "Résolu",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      agent: "Jean-Pierre M.",
      ticketRef: "SAV-418",
      city: "Brazzaville",
      messages: [
        {
          from: "client",
          text: "Colis bien réceptionné par notre équipe à Bacongo. Tout est conforme, merci pour le suivi rapide !",
          time: "08:50"
        },
        {
          from: "agent",
          text: "Ravi d'avoir pu vous assister. Le dossier #SAV-418 est maintenant clôturé. Excellente journée !",
          time: "08:52"
        }
      ]
    }
  ];

  const active = conversations[selectedConv];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 mt-6 sm:mt-10 mb-16">
      
      {/* Container Browser Frame Style macOS / Linear */}
      <div className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-2xl shadow-slate-200/60 overflow-hidden transition-all duration-300">
        
        {/* Topbar: Window Chrome & Address */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-50/80 border-b border-slate-200/80">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-400 border border-rose-500/30" />
            <span className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500/30" />
            <span className="w-3 h-3 rounded-full bg-emerald-400 border border-emerald-500/30" />
            <span className="hidden sm:inline-block ml-3 text-xs font-medium text-slate-400">
              Aperçu Espace Équipe
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-mono text-slate-600 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>app.zadesk.com/workspace/sav-general</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-semibold text-emerald-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>SAV Connecté</span>
            </span>
          </div>
        </div>

        {/* Application Layout: Mini Sidebar + Conversation List + Conversation Detail */}
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px] text-slate-800">
          
          {/* 1. Mini Navigation Sidebar (Desktop only) */}
          <div className="hidden lg:flex lg:col-span-1 bg-slate-50/50 border-r border-slate-200/80 flex-col items-center py-5 space-y-6">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
              Z
            </div>
            <div className="flex-1 space-y-4">
              <button 
                title="Tableau de bord" 
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
              </button>
              <button 
                title="Conversations" 
                className="w-9 h-9 rounded-lg flex items-center justify-center text-emerald-700 bg-emerald-50 border border-emerald-200/60 shadow-xs"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
              <button 
                title="Équipe" 
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <Users className="w-4 h-4" />
              </button>
              <button 
                title="Guichet" 
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <QrCode className="w-4 h-4" />
              </button>
            </div>
            <button 
              title="Paramètres" 
              className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* 2. Middle Panel: Shared Incoming Conversations */}
          <div className="md:col-span-5 lg:col-span-4 border-r border-slate-200/80 bg-white flex flex-col">
            
            {/* Header List */}
            <div className="p-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/30">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Boîte de réception unique
                </h4>
                <p className="text-[11px] text-slate-500">
                  3 demandes actives · 2 agents en ligne
                </p>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>

            {/* Conversation Items */}
            <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
              {conversations.map((c, index) => {
                const isSelected = selectedConv === index;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedConv(index)}
                    className={`w-full text-left p-3.5 transition-all duration-150 flex flex-col gap-1.5 ${
                      isSelected 
                        ? "bg-emerald-50/60 border-l-4 border-l-emerald-600" 
                        : "hover:bg-slate-50 border-l-4 border-l-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {c.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {c.time}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${c.channelColor}`}>
                        {c.channel}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${c.statusColor}`}>
                        {c.status}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-auto">
                        #{c.ticketRef}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-1">
                      {c.subject}
                    </p>
                  </button>
                );
              })}
            </div>
            
            {/* Bottom summary info */}
            <div className="p-3 bg-slate-50/80 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Synchronisation temps réel</span>
              <span className="font-semibold text-slate-700">MTN / Airtel / Web</span>
            </div>
          </div>

          {/* 3. Right Panel: Active Conversation View & Response */}
          <div className="md:col-span-7 lg:col-span-7 bg-white flex flex-col">
            
            {/* Conversation Header */}
            <div className="p-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/40">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-950">
                    {active.name}
                  </h4>
                  <span className="text-xs text-slate-400">· {active.city}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span>Dossier #{active.ticketRef}</span>
                  <span>·</span>
                  <span>Pris en charge par <strong className="text-slate-700 font-medium">{active.agent}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {active.channel}
                </span>
              </div>
            </div>

            {/* Message Thread */}
            <div className="p-5 flex-1 space-y-4 bg-gradient-to-b from-white to-slate-50/40 overflow-y-auto">
              
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                  Demande reçue aujourd&apos;hui
                </span>
              </div>

              {active.messages.map((m, idx) => (
                <div 
                  key={idx} 
                  className={`flex flex-col ${m.from === "client" ? "items-start" : "items-end"}`}
                >
                  <div 
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                      m.from === "client" 
                        ? "bg-slate-100 text-slate-800 rounded-tl-xs border border-slate-200/70" 
                        : "bg-emerald-600 text-white rounded-tr-xs"
                    }`}
                  >
                    <p>{m.text}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {m.from === "client" ? "Client" : "Agent SAV"} · {m.time}
                  </span>
                </div>
              ))}

            </div>

            {/* Quick Actions & Input Area */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200/80 space-y-2.5">
              
              {/* Preset quick actions */}
              <div className="flex items-center gap-2 overflow-x-auto text-[11px]">
                <span className="text-slate-400 font-medium shrink-0">Actions rapides :</span>
                <span className="px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 cursor-pointer shadow-2xs shrink-0">
                  Rassurer le client
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 cursor-pointer shadow-2xs shrink-0">
                  Demander une photo
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 cursor-pointer shadow-2xs shrink-0">
                  Transférer au guichet
                </span>
              </div>

              {/* Input field */}
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value="Votre ligne a été réactivée avec succès, pouvez-vous redémarrer ?"
                  className="flex-1 bg-white border border-slate-200/90 rounded-xl px-3.5 py-2 text-xs text-slate-700 focus:outline-hidden shadow-2xs"
                />
                <button 
                  title="Envoyer la réponse" 
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Répondre</span>
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

