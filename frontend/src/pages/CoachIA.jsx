import React, { useState } from "react";
import { ArrowLeft, Bot, Dumbbell, MessageCircle, Send, Sparkles, Utensils, Wand2 } from "lucide-react";

const quickPrompts = {
  personal: [
    "Gerar treino para hipertrofia",
    "Analisar evolução de um aluno",
    "Criar dieta editável",
    "Resumir aderência da semana",
    "Sugerir feedback automático"
  ],
  student: [
    "Como fazer supino?",
    "O que é hipertrofia?",
    "O que é déficit calórico?",
    "Estou sentindo dor no ombro",
    "O que significa meu IMC?"
  ]
};

function decode(text) {
  return text.replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

export default function CoachIA({ role = "student", student, onClose }) {
  const isPersonal = role === "personal";
  const [messages, setMessages] = useState([
    {
      from: "coach",
      text: isPersonal
        ? "Pronto, Thiago. Posso gerar ideias, relatórios e insights editáveis para você aprovar."
        : "Pronta para ajudar, " + (student?.name?.split(" ")[0] || "Erika") + ". Eu explico execução, músculos, nutrição e avaliação física. Não altero seus treinos: qualquer mudança precisa ser aprovada pelo Personal Thiago Filippo."
    }
  ].map((item) => ({ ...item, text: decode(item.text) })));
  const [input, setInput] = useState("");

  const sendMessage = (text = input) => {
    const clean = text.trim();
    if (!clean) return;
    setMessages((current) => [
      ...current,
      { from: "user", text: clean },
      { from: "coach", text: buildResponse(clean, role) }
    ]);
    setInput("");
  };

  return (
    <section className="coach-page-premium">
      <button className="coach-mobile-close" type="button" onClick={onClose}>
        <ArrowLeft size={18} />
        Fechar chat
      </button>
      <article className="coach-hero-premium">
        <div>
          <p className="eyebrow">{isPersonal ? "Coach IA" : "Assistente Fitness"}</p>
          <h2>{isPersonal ? "Central inteligente do personal" : "Seu assistente fitness pessoal"}</h2>
          <span>{isPersonal ? "Crie ideias e análises para revisar antes de aplicar." : "Tire dúvidas com segurança, sem substituir as orientações do seu personal."}</span>
        </div>
        <img src="/lion-juda-logo.png" alt="Leão de Judá" />
      </article>

      <div className="coach-grid-premium">
        <article className="coach-chat-card">
          <div className="coach-chat-stream">
            {messages.map((message, index) => (
              <div key={message.from + index} className={"coach-message " + message.from}>
                {message.from === "coach" && <Bot size={18} />}
                <p>{message.text}</p>
              </div>
            ))}
          </div>
          <form className="coach-input-row" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}>
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder={isPersonal ? "Digite sua pergunta para o Coach IA..." : "Pergunte ao Assistente Fitness..."} />
            <button type="submit"><Send size={18} /> Enviar</button>
          </form>
        </article>

        <aside className="coach-tools-card">
          <p className="eyebrow">Ações rápidas</p>
          <div>{(quickPrompts[role] || quickPrompts.student).map((prompt) => <button key={prompt} type="button" onClick={() => sendMessage(prompt)}><Sparkles size={17} /> {prompt}</button>)}</div>
          <div className="coach-capabilities">
            <span><Dumbbell size={18} /> {isPersonal ? "Treinos" : "Execução"}</span>
            <span><Utensils size={18} /> {isPersonal ? "Dieta" : "Nutrição"}</span>
            <span><Wand2 size={18} /> {isPersonal ? "Análise" : "Conceitos"}</span>
            <span><MessageCircle size={18} /> {isPersonal ? "Feedback" : "Dúvidas"}</span>
          </div>
          {!isPersonal && <p className="assistant-priority-note">Eu respondo perguntas e explico conceitos. Não altero treino, dieta ou avaliação sem o Personal Thiago Filippo.</p>}
        </aside>
      </div>
    </section>
  );
}

function buildResponse(prompt, role) {
  const lower = prompt.toLowerCase();
  if (lower.includes("supino")) return "No supino, mantenha os pés firmes, escápulas encaixadas para trás e para baixo, punhos alinhados e desça a barra com controle até perto do peito. Suba sem perder estabilidade. Se houver dor no ombro, pare e avise o Personal Thiago Filippo.";
  if (lower.includes("hipertrofia")) return "Hipertrofia é o aumento de massa muscular. Ela acontece com treino bem executado, progressão de carga, alimentação adequada, descanso e constância.";
  if (lower.includes("deficit") || lower.includes("déficit")) return "Déficit calórico é consumir menos calorias do que o corpo gasta. Ele ajuda na perda de gordura, mas precisa preservar proteínas, treino de força e saúde.";
  if (lower.includes("dor") || lower.includes("ombro")) return "Dor no ombro não deve ser ignorada. Pare o exercício se for dor aguda, forte ou com perda de força. Grave a execução se puder e envie ao Personal Thiago Filippo para ele avaliar.";
  if (lower.includes("imc")) return "IMC relaciona peso e altura. Ele ajuda como indicador geral, mas não mostra tudo: massa magra, gordura corporal, medidas e fotos também precisam ser analisadas.";
  if (lower.includes("treino") || lower.includes("carga") || lower.includes("exerc")) return role === "personal" ? "Posso sugerir uma análise, mas a alteração final deve ser salva por você no treino do aluno." : "Posso explicar a execução e os músculos trabalhados, mas não altero seu treino. Mudanças só com o Personal Thiago Filippo.";
  if (lower.includes("dieta") || lower.includes("refei") || lower.includes("calor")) return role === "personal" ? "Posso gerar uma sugestão editável de dieta para você revisar antes de enviar ao aluno." : "Posso explicar alimentos, macros e calorias, mas não altero sua dieta. Use como apoio e confirme ajustes com o personal.";
  return role === "personal" ? "Boa pergunta. Posso transformar isso em uma sugestão prática para você revisar antes de aplicar." : "Boa pergunta. Vou te orientar de forma educativa, sem alterar seu treino ou dieta. As decisões finais ficam com o Personal Thiago Filippo.";
}
