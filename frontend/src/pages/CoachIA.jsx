import React, { useState } from "react";
import { ArrowLeft, Bot, Dumbbell, MessageCircle, Send, Sparkles, Utensils, Wand2 } from "lucide-react";

const quickPrompts = {
  personal: [
    "Gerar treino para hipertrofia",
    "Analisar evolucao de um aluno",
    "Criar dieta editavel",
    "Resumir aderencia da semana",
    "Sugerir feedback automatico"
  ],
  student: [
    "Como fazer supino?",
    "O que e hipertrofia?",
    "O que e deficit calorico?",
    "Estou sentindo dor no ombro",
    "O que significa meu IMC?"
  ]
};

export default function CoachIA({ role = "student", student, onClose }) {
  const isPersonal = role === "personal";
  const [messages, setMessages] = useState([
    {
      from: "coach",
      text: isPersonal
        ? "Pronto, Thiago. Posso gerar treinos, dietas, relatorios e insights dos alunos."
        : `Pronta para te ajudar, ${student?.name?.split(" ")[0] || "Erika"}. Posso explicar exercicios, musculos, execucao, nutricao e avaliacao fisica. As orientacoes do Personal Thiago Filippo tem prioridade.`
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
          <p className="eyebrow">{isPersonal ? "Coach IA" : "Assistente Fitness"}</p>
          <h2>{isPersonal ? "Central inteligente do personal" : "Seu assistente fitness pessoal"}</h2>
          <span>
            {isPersonal
              ? "Crie, analise e otimize alunos com velocidade profissional."
              : "Explique exercicios, nutricao, dores, execucao e conceitos fitness sem substituir seu personal."}
          </span>
        </div>
        <img src="/lion-juda-logo.png" alt="Leao de Juda" />
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
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={isPersonal ? "Digite sua pergunta para o Coach IA..." : "Pergunte ao Assistente Fitness..."}
            />
            <button type="submit"><Send size={18} /> Enviar</button>
          </form>
        </article>

        <aside className="coach-tools-card">
          <p className="eyebrow">Acoes rapidas</p>
          <div>
            {(quickPrompts[role] || quickPrompts.student).map((prompt) => (
              <button key={prompt} type="button" onClick={() => sendMessage(prompt)}>
                <Sparkles size={17} /> {prompt}
              </button>
            ))}
          </div>
          <div className="coach-capabilities">
            <span><Dumbbell size={18} /> {isPersonal ? "Treinos" : "Execucao"}</span>
            <span><Utensils size={18} /> {isPersonal ? "Dieta" : "Nutricao"}</span>
            <span><Wand2 size={18} /> {isPersonal ? "Analise" : "Conceitos"}</span>
            <span><MessageCircle size={18} /> {isPersonal ? "Feedback" : "Duvidas"}</span>
          </div>
          {!isPersonal && (
            <p className="assistant-priority-note">
              As orientacoes do Personal Thiago Filippo tem prioridade sobre qualquer informacao fornecida pelo assistente.
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}

function buildResponse(prompt, role) {
  const lower = prompt.toLowerCase();
  if (lower.includes("dieta") || lower.includes("refei") || lower.includes("calor")) {
    return role === "personal"
      ? "Sugestao criada: plano com proteina alta, carboidrato ajustado ao treino, fibras em todas as refeicoes e substituicoes editaveis para o aluno."
      : "Posso explicar conceitos de nutricao, mas nao altero sua dieta. Para ajustes, siga o plano do Personal Thiago Filippo.";
  }
  if (lower.includes("treino") || lower.includes("carga") || lower.includes("supino") || lower.includes("exercicio")) {
    return role === "personal"
      ? "Analise volume semanal, tecnica e descanso. Posso sugerir progressao de carga por exercicio e distribuir treinos por dia."
      : "Posso explicar execucao e musculos trabalhados, mas nao altero seu treino. Se sentir dor, avise o personal antes de continuar.";
  }
  if (lower.includes("dor") || lower.includes("ombro") || lower.includes("desconforto")) {
    return "Se houver dor aguda, formigamento ou perda de forca, pare o exercicio e fale com o Personal Thiago Filippo. Posso ajudar a entender possiveis causas, mas nao substituo avaliacao profissional.";
  }
  if (lower.includes("evol") || lower.includes("avalia") || lower.includes("imc")) {
    return role === "personal"
      ? "A evolucao mostra melhora de consistencia, reducao de gordura e ganho de performance. O proximo passo e manter rotina e ajustar hidratacao."
      : "Posso te ajudar a entender sua avaliacao, como IMC e composicao corporal. A interpretacao final e os ajustes devem vir do Personal Thiago Filippo.";
  }
  return role === "personal"
    ? "Boa pergunta. Minha recomendacao e olhar treino, dieta, descanso e constancia juntos. Posso transformar isso em uma acao pratica agora."
    : "Boa pergunta. Posso explicar o conceito e orientar sinais de atencao, mas as orientacoes do Personal Thiago Filippo tem prioridade.";
}
