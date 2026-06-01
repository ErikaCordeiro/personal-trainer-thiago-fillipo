import React, { useMemo, useState } from "react";
import {
  Apple,
  Bot,
  Camera,
  Check,
  CheckCircle2,
  Droplets,
  Flame,
  Leaf,
  Pencil,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Utensils,
  X
} from "lucide-react";

const meals = [
  {
    time: "07:00",
    name: "Cafe da manha",
    description: "Aveia com frutas, whey protein e chia",
    image: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=520&q=80",
    calories: 542,
    protein: 34,
    carbs: 68,
    fats: 14,
    notes: "Priorize a proteina antes do cafe.",
    substitutions: "Ovos mexidos, iogurte natural ou panqueca de banana.",
    done: true
  },
  {
    time: "10:30",
    name: "Lanche da manha",
    description: "Iogurte natural com frutas e granola",
    image: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=520&q=80",
    calories: 236,
    protein: 16,
    carbs: 28,
    fats: 6,
    notes: "Boa opcao para manter saciedade.",
    substitutions: "Whey com fruta, cottage ou mix de castanhas.",
    done: true
  },
  {
    time: "13:00",
    name: "Almoco",
    description: "Frango grelhado com arroz integral e legumes",
    image: "https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?auto=format&fit=crop&w=520&q=80",
    calories: 680,
    protein: 48,
    carbs: 72,
    fats: 18,
    notes: "Refeicao principal para energia e recuperacao.",
    substitutions: "Patinho, tilapia, feijao, batata doce ou legumes assados.",
    done: true
  },
  {
    time: "16:30",
    name: "Lanche da tarde",
    description: "Maca com pasta de amendoim e castanhas",
    image: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=520&q=80",
    calories: 210,
    protein: 6,
    carbs: 25,
    fats: 10,
    notes: "Use como pre-treino leve.",
    substitutions: "Banana com aveia, tapioca com ovo ou shake proteico.",
    done: true
  },
  {
    time: "19:30",
    name: "Jantar",
    description: "Salmao com batata doce e salada verde",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=520&q=80",
    calories: 610,
    protein: 46,
    carbs: 55,
    fats: 22,
    notes: "Jantar rico em proteina e micronutrientes.",
    substitutions: "Frango, carne magra, omelete, quinoa ou mandioca.",
    done: true
  },
  {
    time: "22:00",
    name: "Ceia",
    description: "Coalhada com chia e canela",
    image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=520&q=80",
    calories: 172,
    protein: 11,
    carbs: 12,
    fats: 4,
    notes: "Opcional caso sinta fome a noite.",
    substitutions: "Iogurte, caseina, leite proteico ou fruta pequena.",
    done: false
  }
];

const initialFoods = [
  { id: "food-1", name: "Arroz integral", amount: 150, unit: "g", calories: 170, protein: 4, carbs: 35, fats: 1 },
  { id: "food-2", name: "Peito de frango grelhado", amount: 120, unit: "g", calories: 198, protein: 37, carbs: 0, fats: 4 },
  { id: "food-3", name: "Feijao carioca", amount: 80, unit: "g", calories: 90, protein: 6, carbs: 16, fats: 1 },
  { id: "food-4", name: "Salada verde", amount: 50, unit: "g", calories: 15, protein: 1, carbs: 3, fats: 0 },
  { id: "food-5", name: "Azeite de oliva", amount: 10, unit: "ml", calories: 90, protein: 0, carbs: 0, fats: 10 }
];

const recipes = [
  {
    name: "Panqueca de banana com aveia",
    type: "Doce fit",
    calories: 280,
    protein: 18,
    carbs: 36,
    fats: 7,
    level: "Facil",
    time: "12 min",
    image: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=520&q=80",
    ingredients: ["1 banana madura", "2 ovos", "3 colheres de aveia", "Canela", "1 scoop de whey opcional"],
    steps: ["Amasse a banana e misture os ovos.", "Adicione aveia e canela.", "Doure em frigideira antiaderente."]
  },
  {
    name: "Frango ao molho de mostarda",
    type: "Hipertrofia",
    calories: 520,
    protein: 48,
    carbs: 42,
    fats: 16,
    level: "Medio",
    time: "25 min",
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=520&q=80",
    ingredients: ["150g de frango", "1 colher de mostarda", "Iogurte natural", "Arroz integral", "Legumes"],
    steps: ["Grelhe o frango.", "Misture mostarda com iogurte para o molho.", "Sirva com arroz e legumes."]
  },
  {
    name: "Brownie fit de chocolate",
    type: "Doces fit",
    calories: 180,
    protein: 12,
    carbs: 22,
    fats: 5,
    level: "Facil",
    time: "20 min",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=520&q=80",
    ingredients: ["Cacau 100%", "Banana", "Aveia", "Ovo", "Whey chocolate"],
    steps: ["Misture todos os ingredientes.", "Coloque em forma pequena.", "Asse ate firmar."]
  },
  {
    name: "Marmita fitness completa",
    type: "Marmitas",
    calories: 450,
    protein: 38,
    carbs: 48,
    fats: 11,
    level: "Facil",
    time: "30 min",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=520&q=80",
    ingredients: ["Frango desfiado", "Arroz integral", "Feijao", "Brocolis", "Cenoura"],
    steps: ["Prepare a proteina em lote.", "Monte porcoes equilibradas.", "Congele por ate 7 dias."]
  },
  {
    name: "Mousse proteico",
    type: "Pos treino",
    calories: 160,
    protein: 24,
    carbs: 12,
    fats: 3,
    level: "Facil",
    time: "8 min",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=520&q=80",
    ingredients: ["Iogurte natural", "Whey", "Cacau", "Morango", "Chia"],
    steps: ["Misture iogurte, whey e cacau.", "Leve a geladeira.", "Finalize com morango e chia."]
  }
];

const lunchboxes = [
  ["Emagrecimento", "Frango, arroz integral, feijao e salada", "430 kcal", "42P / 46C / 9G"],
  ["Ganho de massa", "Patinho, batata doce, legumes e azeite", "620 kcal", "48P / 72C / 18G"],
  ["Low carb", "Omelete, legumes, abacate e folhas", "390 kcal", "32P / 14C / 24G"],
  ["Economica", "Ovos, arroz, feijao, cenoura e couve", "470 kcal", "28P / 62C / 12G"],
  ["Rapida", "Atum, mandioca, tomate e pepino", "410 kcal", "35P / 44C / 8G"],
  ["Congelavel", "Frango desfiado, pure de abobora e brocolis", "360 kcal", "38P / 30C / 8G"]
];

const dailyStats = [
  ["Calorias diarias", "2.450", "/ 2.600 kcal", 94, Flame],
  ["Proteinas", "180g", "/ 195g", 92, Utensils],
  ["Carboidratos", "250g", "/ 270g", 93, Leaf],
  ["Gorduras", "70g", "/ 80g", 88, Droplets],
  ["Fibras", "28g", "/ 30g", 93, Apple]
];

export default function StudentDiet({ student }) {
  const [water, setWater] = useState(2.1);
  const [waterAmount, setWaterAmount] = useState("300");
  const [foods, setFoods] = useState([]);
  const [mealName, setMealName] = useState("Almoco");
  const [mealTime, setMealTime] = useState("13:00");
  const [mealPhoto, setMealPhoto] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [modal, setModal] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const waterGoal = useMemo(() => {
    const weightGoal = Number(student?.weight || 68) * 0.035;
    return Math.max(2.6, Math.min(3.5, weightGoal + 0.35));
  }, [student]);
  const waterPercent = Math.min(100, Math.round((water / waterGoal) * 100));
  const totalCalories = foods.reduce((sum, food) => sum + Number(food.calories || 0), 0);
  const totalProtein = foods.reduce((sum, food) => sum + Number(food.protein || 0), 0);
  const totalCarbs = foods.reduce((sum, food) => sum + Number(food.carbs || 0), 0);
  const totalFats = foods.reduce((sum, food) => sum + Number(food.fats || 0), 0);

  const updateFood = (id, field, value) => {
    setFoods((current) => current.map((food) => food.id === id ? { ...food, [field]: value } : food));
  };

  const addFood = () => {
    setFoods((current) => [...current, {
      id: crypto.randomUUID(),
      name: "Novo alimento",
      amount: 100,
      unit: "g",
      calories: 100,
      protein: 5,
      carbs: 10,
      fats: 3
    }]);
  };

  const removeFood = (id) => {
    setFoods((current) => current.filter((food) => food.id !== id));
  };

  const registerWater = () => {
    const numeric = Number(String(waterAmount).replace(",", "."));
    if (!Number.isFinite(numeric) || numeric <= 0) return;
    const liters = numeric > 10 ? numeric / 1000 : numeric;
    setWater((current) => Math.min(waterGoal, Number((current + liters).toFixed(2))));
  };

  const saveMeal = () => {
    if (!mealName.trim() || foods.length === 0) {
      setSavedMessage("Informe o nome da refeicao e pelo menos 1 alimento.");
      return;
    }
    const invalid = foods.some((food) => [food.amount, food.calories, food.protein, food.carbs, food.fats].some((value) => Number(value) < 0));
    if (invalid) {
      setSavedMessage("Calorias, quantidade e macros precisam ser numeros positivos.");
      return;
    }
    setSavedMessage("Refeicao salva no historico alimentar e enviada para o personal.");
    setModal(null);
  };

  const openRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setModal("recipe");
  };

  const handleMealPhotoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setMealPhoto(URL.createObjectURL(file));
    setFoods(initialFoods);
  };

  const saveRecipeAction = (message) => {
    setSavedMessage(message);
    setModal(null);
  };

  return (
    <section className="student-diet-page">
      <section className="nutrition-kpi-grid">
        {dailyStats.map(([label, value, goal, percent, Icon]) => (
          <article key={label} className="nutrition-kpi-card">
            <Icon size={22} />
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{goal}</small>
            <div className="nutrition-progress"><span style={{ width: `${percent}%` }} /></div>
            <em>{percent}% da meta</em>
          </article>
        ))}
      </section>

      <section className="nutrition-main-grid">
        <div className="nutrition-left-column">
          <article className="nutrition-card meals-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Suas refeicoes de hoje</p>
                <h2>Plano alimentar diario</h2>
              </div>
              <button type="button" onClick={() => setModal("plan")}>Ver plano alimentar diario</button>
            </div>
            <div className="meal-list">
              {meals.map((meal) => (
                <article key={meal.name} className="meal-card">
                  <time>{meal.time}</time>
                  <img src={meal.image} alt={meal.name} />
                  <div>
                    <h3>{meal.name}</h3>
                    <p>{meal.description}</p>
                    <span>{meal.calories} kcal - {meal.protein}g P - {meal.carbs}g C - {meal.fats}g G</span>
                  </div>
                  <button type="button" aria-label={`Detalhes de ${meal.name}`} onClick={() => setModal("plan")}>
                    {meal.done ? <CheckCircle2 size={23} /> : <Pencil size={21} />}
                  </button>
                </article>
              ))}
            </div>
            <button className="register-meal-button" type="button" onClick={() => setModal("meal") }>
              <Plus size={18} />
              Registrar refeicao
            </button>
          </article>

          <article className="nutrition-card ai-meal-panel premium-ai-analysis">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Registrar refeicao com IA</p>
                <h2>Analise alimentar por foto</h2>
              </div>
              <Sparkles size={22} />
            </div>
            <p className="ai-disclaimer">A analise por foto e uma estimativa. Você pode editar os alimentos e quantidades antes de salvar.</p>
            <div className={`ai-meal-grid compact-ai-preview ${mealPhoto ? "has-analysis" : "awaiting-photo"}`}>
              <div className="meal-photo-card empty-photo-card">
                {mealPhoto ? (
                  <img src={mealPhoto} alt="Refeicao analisada" />
                ) : (
                  <div className="empty-meal-photo">
                    <Camera size={34} />
                    <strong>Adicionar foto do prato</strong>
                    <span>A leitura da comida aparece logo depois do envio.</span>
                  </div>
                )}
                <button type="button" onClick={() => setModal("meal")}><Camera size={18} /> Tirar foto ou enviar imagem</button>
              </div>
              {mealPhoto ? (
                <div className="ai-summary-panel">
                  <span>Alimentos identificados</span>
                  <strong>{foods.length} itens - {totalCalories} kcal</strong>
                  <p>{totalProtein}g proteina - {totalCarbs}g carboidratos - {totalFats}g gorduras</p>
                  <div className="ai-food-chips">
                    {foods.slice(0, 5).map((food) => <em key={food.id}>{food.name}</em>)}
                  </div>
                  <button type="button" onClick={() => setModal("meal")}>Editar analise</button>
                </div>
              ) : null}
            </div>
          </article>

          <div className="nutrition-bottom-grid">
            <article className="nutrition-card food-evolution-card">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Evolução alimentar</p>
                  <h2>Ultimos 7 dias</h2>
                </div>
                <span>Calorias</span>
              </div>
              <div className="food-bars">
                {[68, 82, 74, 79, 62, 88, 94].map((value, index) => (
                  <div key={index}>
                    <span style={{ height: `${value}%` }} />
                    <small>{["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"][index]}</small>
                  </div>
                ))}
              </div>
              <p>Adesao alimentar: 87% - Hidratacao: {waterPercent}%</p>
            </article>

            <article className="nutrition-card tips-card">
              <p className="eyebrow">Dicas de hoje</p>
              <ul>
                <li>Beba agua ao longo do dia, nao tudo de uma vez.</li>
                <li>Priorize proteina em todas as refeicoes.</li>
                <li>Inclua fibras para melhorar saciedade e intestino.</li>
              </ul>
            </article>
          </div>
        </div>

        <aside className="nutrition-right-column">
          <article className="nutrition-card hydration-panel">
            <p className="eyebrow">Hidratacao</p>
            <strong>{water.toFixed(1).replace(".", ",")} L <small>/ {waterGoal.toFixed(1).replace(".", ",")} L</small></strong>
            <span>{waterPercent}% da meta diaria</span>
            <div className="water-drops">
              {Array.from({ length: 7 }).map((_, index) => <Droplets key={index} size={26} className={index < Math.round((waterPercent / 100) * 7) ? "active" : ""} />)}
            </div>
            <label>
              <span>Registrar agua</span>
              <input value={waterAmount} onChange={(event) => setWaterAmount(event.target.value)} placeholder="300 ml ou 0.3 L" />
            </label>
            <button type="button" onClick={registerWater}>Registrar agua</button>
          </article>

          <article className="nutrition-card water-recommendation">
            <p className="eyebrow">Recomendacao de agua</p>
            <h2>{waterGoal.toFixed(1).replace(".", ",")} L</h2>
            <span>por dia</span>
            <p>Com base na sua avaliação física, objetivo, frequencia de treino e peso atual, recomendamos esta meta diaria.</p>
          </article>

          <article className="nutrition-card food-coach-card">
            <div>
              <p className="eyebrow">Coach IA <span>Novo</span></p>
              <h2>Seu assistente inteligente para te ajudar a evoluir na alimentacao.</h2>
              <ul>
                <li>Sugerir receitas</li>
                <li>Montar marmitas</li>
                <li>Substituir alimentos</li>
                <li>Calcular refeicao por foto</li>
              </ul>
              <button type="button">Abrir Coach IA</button>
            </div>
            <img src="/lion-juda-logo.png" alt="" />
          </article>

          <article className="nutrition-card recipe-panel">
            <p className="eyebrow">Sugestoes para voce</p>
            <h2>Receitas gostosas e saudaveis</h2>
            <div className="recipe-list">
              {recipes.map((recipe) => (
                <article key={recipe.name}>
                  <img src={recipe.image} alt={recipe.name} />
                  <div>
                    <strong>{recipe.name}</strong>
                    <span>{recipe.type} - {recipe.calories} kcal - {recipe.level} - {recipe.time}</span>
                  </div>
                  <div className="recipe-buttons">
                    <button type="button" onClick={() => openRecipe(recipe)}>Ver receita</button>
                    <button type="button" onClick={() => saveRecipeAction(`${recipe.name} salva nas favoritas.`)}>Salvar</button>
                    <button type="button" onClick={() => saveRecipeAction(`${recipe.name} adicionada a dieta de hoje.`)}>Adicionar</button>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <article className="nutrition-card lunchbox-panel">
            <p className="eyebrow">Ideias de marmitas</p>
            {lunchboxes.map(([name, ingredients, calories, macros]) => (
              <div key={name}>
                <strong>{name}</strong>
                <span>{ingredients}</span>
                <small>{calories} - {macros}</small>
              </div>
            ))}
          </article>
        </aside>
      </section>

      {savedMessage && <div className="floating-save-message"><Check size={16} /> {savedMessage}</div>}

      <button className="mobile-meal-cta" type="button" onClick={() => setModal("meal")}>
        <Camera size={18} />
        Registrar refeicao
      </button>

      {modal === "plan" && (
        <div className="nutrition-modal-backdrop" role="presentation" onMouseDown={() => setModal(null)}>
          <article className="nutrition-modal daily-plan-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" onClick={() => setModal(null)} aria-label="Fechar"><X size={20} /></button>
            <p className="eyebrow">Plano alimentar completo</p>
            <h2>Seu dia nutricional</h2>
            <div className="daily-plan-list">
              {meals.map((meal) => (
                <div key={meal.name} className="daily-plan-meal">
                  <time>{meal.time}</time>
                  <img src={meal.image} alt={meal.name} />
                  <div>
                    <strong>{meal.name}</strong>
                    <p>{meal.description}</p>
                    <span>{meal.calories} kcal - {meal.protein}g P - {meal.carbs}g C - {meal.fats}g G</span>
                    <small>Obs: {meal.notes}</small>
                    <small>Substituicoes: {meal.substitutions}</small>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      )}

      {modal === "meal" && (
        <div className="nutrition-modal-backdrop" role="presentation" onMouseDown={() => setModal(null)}>
          <article className="nutrition-modal meal-register-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" onClick={() => setModal(null)} aria-label="Fechar"><X size={20} /></button>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Registrar refeicao com IA</p>
                <h2>Analise alimentar por foto</h2>
              </div>
              <Bot size={24} />
            </div>
            <p className="ai-disclaimer">Envie uma foto do prato. Depois disso a IA monta uma estimativa editavel dos alimentos, peso e macros.</p>
            <div className={`meal-register-grid ${mealPhoto ? "has-analysis" : "awaiting-photo"}`}>
              <div className="meal-upload-card">
                {mealPhoto ? (
                  <img src={mealPhoto} alt="Imagem da refeicao" />
                ) : (
                  <div className="empty-meal-photo modal-empty-photo">
                    <Camera size={42} />
                    <strong>Foto vazia</strong>
                    <span>Toque no botao abaixo para enviar ou tirar a foto da refeicao.</span>
                  </div>
                )}
                <label>
                  <Camera size={18} />
                  Tirar foto ou enviar imagem
                  <input type="file" accept="image/*" capture="environment" onChange={handleMealPhotoUpload} />
                </label>
              </div>
              {mealPhoto ? (
              <div className="meal-editor-panel">
                <div className="meal-editor-head">
                  <label>
                    <span>Nome da refeicao</span>
                    <input value={mealName} onChange={(event) => setMealName(event.target.value)} />
                  </label>
                  <label>
                    <span>Horario</span>
                    <input value={mealTime} onChange={(event) => setMealTime(event.target.value)} />
                  </label>
                </div>
                <div className="food-table enhanced-food-table">
                  <div className="food-table-labels"><span>Alimento</span><span>Qtd</span><span>Un</span><span>Kcal</span><span>P</span><span>C</span><span>G</span><span></span></div>
                  {foods.map((food) => (
                    <div className="food-row" key={food.id}>
                      <input value={food.name} onChange={(event) => updateFood(food.id, "name", event.target.value)} aria-label="Alimento" />
                      <input value={food.amount} type="number" min="0" onChange={(event) => updateFood(food.id, "amount", event.target.value)} aria-label="Quantidade" />
                      <input value={food.unit} onChange={(event) => updateFood(food.id, "unit", event.target.value)} aria-label="Unidade" />
                      <input value={food.calories} type="number" min="0" onChange={(event) => updateFood(food.id, "calories", event.target.value)} aria-label="Calorias" />
                      <input value={food.protein} type="number" min="0" onChange={(event) => updateFood(food.id, "protein", event.target.value)} aria-label="Proteinas" />
                      <input value={food.carbs} type="number" min="0" onChange={(event) => updateFood(food.id, "carbs", event.target.value)} aria-label="Carboidratos" />
                      <input value={food.fats} type="number" min="0" onChange={(event) => updateFood(food.id, "fats", event.target.value)} aria-label="Gorduras" />
                      <button type="button" onClick={() => removeFood(food.id)} aria-label="Remover alimento"><Trash2 size={15} /></button>
                    </div>
                  ))}
                </div>
                <div className="meal-total-card">
                  <span>Total estimado</span>
                  <strong>{totalCalories} kcal</strong>
                  <small>{totalProtein}g P - {totalCarbs}g C - {totalFats}g G</small>
                </div>
                <div className="identified-actions">
                  <button type="button" onClick={addFood}><Plus size={16} /> Adicionar alimento</button>
                  <button type="button" onClick={saveMeal}><Save size={16} /> Salvar refeicao</button>
                </div>
              </div>
              ) : null}
            </div>
          </article>
        </div>
      )}

      {modal === "recipe" && selectedRecipe && (
        <div className="nutrition-modal-backdrop" role="presentation" onMouseDown={() => setModal(null)}>
          <article className="nutrition-modal recipe-detail-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" onClick={() => setModal(null)} aria-label="Fechar"><X size={20} /></button>
            <div className="recipe-detail-grid">
              <img src={selectedRecipe.image} alt={selectedRecipe.name} />
              <div>
                <p className="eyebrow">{selectedRecipe.type}</p>
                <h2>{selectedRecipe.name}</h2>
                <div className="recipe-macro-grid">
                  <span>{selectedRecipe.calories} kcal</span>
                  <span>{selectedRecipe.protein}g proteina</span>
                  <span>{selectedRecipe.carbs}g carbs</span>
                  <span>{selectedRecipe.fats}g gorduras</span>
                  <span>{selectedRecipe.time}</span>
                  <span>{selectedRecipe.level}</span>
                </div>
                <h3>Ingredientes</h3>
                <ul>{selectedRecipe.ingredients.map((item) => <li key={item}>{item}</li>)}</ul>
                <h3>Modo de preparo</h3>
                <ol>{selectedRecipe.steps.map((item) => <li key={item}>{item}</li>)}</ol>
                <div className="recipe-modal-actions">
                  <button type="button" onClick={() => saveRecipeAction(`${selectedRecipe.name} salva nas favoritas.`)}>Salvar</button>
                  <button type="button" onClick={() => saveRecipeAction(`${selectedRecipe.name} adicionada a dieta de hoje.`)}>Adicionar a dieta</button>
                </div>
              </div>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}