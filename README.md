# TERMO PLUS

Um jogo de adivinhar palavras inspirado no Wordle, desenvolvido especificamente para o português brasileiro com múltiplos modos de jogo.

## 🎮 Modos de Jogo

- **TERMO** (Normal): 1 palavra de 5 letras, 6 tentativas
- **DUETO**: 2 palavras simultâneas, 7 tentativas 
- **QUARTETO**: 4 palavras simultâneas, 8 tentativas
- **ALEATÓRIO**: Palavras aleatórias com limite diário de 5 partidas

## ✨ Funcionalidades

- 🎯 Múltiplos modos de jogo com dificuldades crescentes
- 🌙 Interface elegante com tema escuro
- ⌨️ Suporte a teclado físico e virtual
- 📊 Sistema de estatísticas e compartilhamento
- 🔄 Animações suaves nos tiles
- 📱 Design responsivo (mobile-first)
- ♿ Acessibilidade com ARIA labels

## 🎨 Como Jogar

1. **Objetivo**: Descubra a(s) palavra(s) secreta(s) em um número limitado de tentativas
2. **Dicas visuais**:
   - 🟩 **Verde**: Letra correta na posição certa
   - 🟨 **Amarelo**: Letra existe na palavra, mas em posição errada  
   - ⬛ **Cinza**: Letra não existe na palavra
3. **Regras**:
   - Todas as palavras têm 5 letras
   - Acentos são automaticamente preenchidos
   - Palavras podem ter letras repetidas
   - Uma nova palavra aparece a cada dia

## 🚀 Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Estado**: Context API + useReducer
- **Build**: Vite
- **Icons**: Lucide React

## 📱 Design System

O jogo utiliza um design system customizado com:
- Paleta de cores otimizada para o jogo (verde, amarelo, cinza)
- Tema escuro elegante
- Componentes reutilizáveis
- Animações CSS personalizadas
- Tokens semânticos para consistência

## 🛠️ Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 🎯 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes base (shadcn/ui)
│   ├── GameBoard.tsx   # Grid principal do jogo
│   ├── GameKeyboard.tsx # Teclado virtual
│   ├── GameTile.tsx    # Célula individual
│   └── ...
├── contexts/           # Context providers
│   └── GameContext.tsx # Estado global do jogo
├── pages/              # Páginas da aplicação
├── utils/              # Utilitários e helpers
└── styles/             # Estilos globais
```

## 🎮 Lógica do Jogo

### Validação de Palavras
- Normalização automática (remove acentos)
- Validação de comprimento e caracteres
- Lógica de posicionamento para múltiplas ocorrências

### Estados do Jogo
- **Playing**: Jogo em andamento
- **Won**: Todas as palavras descobertas
- **Lost**: Tentativas esgotadas

### Modos Especiais
- **Dueto/Quarteto**: Múltiplas grades sincronizadas
- **Aleatório**: Sistema de limite diário por usuário

## 📊 Funcionalidades Avançadas

- Sistema de estatísticas persistente
- Compartilhamento com emoji grid
- Validação robusta de entrada
- Animações de feedback visual
- Suporte a teclado físico

## 🚀 Deploy

O projeto está configurado para deploy em:
- **Vercel** (recomendado)
- **Netlify** 
- **GitHub Pages**

## 📄 Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

**Divirta-se jogando TERMO!** 🎯
