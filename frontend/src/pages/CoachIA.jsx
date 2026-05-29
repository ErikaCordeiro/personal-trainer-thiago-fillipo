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
    "Tirar dúvida sobre meu treino",
    "Sugerir refeição saudável",
    "Analisar minha evolução",
    "Me motivar hoje",
    "Explicar minha avaliação física"
  ]
};

export default function CoachIA({ role = "student", student, onClose }) {
  const [messages, setMessages] = useState([
    {
      from: "coach",
      text: role === "personal"
        ? "Pronto, Thiago. Posso gerar treinos, dietas, relatórios e insights dos alunos."
        : `Pronta para te ajudar, ${student?.name?.split(" ")[0] || "Erika"}. Pergunte sobre treino, dieta, evolução ou avaliação.`
    }
  ]);
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
          <p className="eyebrow">Coach IA</p>
          <h2>{role === "personal" ? "Central inteligente do personal" : "Seu assistente fitness pessoal"}</h2>
          <span>{role === "personal" ? "Crie, analise e otimize alunos com velocidade profissional." : "Treino, dieta, evolução e motivação em um lugar só."}</span>
        </div>
        <img src="/lion-juda-logo.png" alt="Leão de Judá" />
      </article>

      <div className="coach-grid-premium">
        <article className="coach-chat-card">
          <div className="coach-chat-stream">
            {messages.map((message, index) => (
              <div key={`${message.from}-${index}`} className={`coach-message ${message.from}`}>
                {message.from === "coach" && <Bot size={18} />}
                <p>{message.text}</p>
              </div>
            ))}
          </div>
          <form className="coach-input-row" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}>
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Digite sua pergunta para o Coach IA..." />
            <button type="submit"><Send size={18} /> Enviar</button>
          </form>
        </article>

        <aside className="coach-tools-card">
          <p className="eyebrow">Ações rápidas</p>
          <div>
            {(quickPrompts[role] || quickPrompts.student).map((prompt) => (
              <button key={prompt} type="button" onClick={() => sendMessage(prompt)}>
                <Sparkles size={17} /> {prompt}
              </button>
            ))}
          </div>
          <div className="coach-capabilities">
            <span><Dumbbell size={18} /> Treinos</span>
            <span><Utensils size={18} /> Dieta</span>
            <span><Wand2 size={18} /> Análise</span>
            <span><MessageCircle size={18} /> Feedback</span>
          </div>
        </aside>
      </div>
    </section>
  );
}

function buildResponse(prompt, role) {
  const lower = prompt.toLowerCase();
  if (lower.includes("dieta") || lower.includes("refei")) {
    return role === "personal"
      ? "Sugestão criada: plano com proteína alta, carboidrato ajustado ao treino, fibras em todas as refeições e substituições editáveis para o aluno."
      : "Para hoje, priorize proteína em cada refeição, mantenha água constante e escolha carboidratos melhores perto do treino.";
  }
  if (lower.includes("treino") || lower.includes("carga")) {
    return role === "personal"
      ? "Analise volume semanal, técnica e descanso. Posso sugerir progressão de carga por exercício e distribuir treinos por dia."
      : "Seu foco deve ser execução limpa. Se completou todas as séries com segurança, registre a carga e progrida aos poucos.";
  }
  if (lower.includes("evol") || lower.includes("avalia")) {
    return "Sua evolução mostra melhora de consistência, redução de gordura e ganho de performance. O próximo passo é manter rotina e ajustar hidratação.";
  }
  return "Boa pergunta. Minha recomendação é olhar treino, dieta, descanso e constância juntos. Posso transformar isso em uma ação prática agora.";
}
