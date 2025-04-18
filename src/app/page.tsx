"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardTitle // Mantido para o estilo do título, mas poderia ser uma div normal
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Send, User, Bot, Sparkles, AlertCircle } from 'lucide-react';

interface Message {
  id: number;
  sender: 'user' | 'ai';
  text: string;
}

export default function ExcuseGeneratorPage() {
  const [problemInput, setProblemInput] = useState<string>('');
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    const scrollViewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollViewport) {
      // Usar setTimeout(0) para garantir que o scroll ocorra após a atualização do DOM
      setTimeout(() => {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }, 0);
    }
  };

  // useEffect para scrollar quando a conversa ou o estado de loading mudam
  useEffect(() => {
    scrollToBottom();
  }, [conversation, isLoading]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProblemInput(event.target.value);
  };

  const handleSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const trimmedInput = problemInput.trim();

    if (!trimmedInput || isLoading) return;

    setError(null);
    setIsLoading(true); // Inicia o loading

    const userMessage: Message = {
      id: Date.now(),
      sender: 'user',
      text: trimmedInput,
    };
    // Adiciona a mensagem do usuário imediatamente
    setConversation((prevConversation) => [...prevConversation, userMessage]);
    setProblemInput(''); // Limpa o input

    try {
      // Chamada para a API
      const response = await fetch('https://gerador-desculpas-openai-backend-production.up.railway.app/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userProblem: trimmedInput }),
      });

      // Tratamento de erro da resposta
      if (!response.ok) {
        let errorMsg = `Erro ${response.status}: ${response.statusText}`;
        try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;
        } catch (parseError) {
            // Se o corpo do erro não for JSON, ignora e usa o statusText
        }
        throw new Error(errorMsg);
      }

      // Processa a resposta da IA
      const excuseText = await response.text();
      const aiMessage: Message = {
        id: Date.now() + 1, // Garante ID único
        sender: 'ai',
        text: excuseText.trim(),
      };
      // Adiciona a mensagem da IA
      setConversation((prevConversation) => [...prevConversation, aiMessage]);

    } catch (err: any) {
      // Tratamento de erro da chamada fetch ou da resposta
      console.error("Falha ao buscar desculpa:", err);
      const errorMessage = err.message || 'Não foi possível conectar à API. Verifique se o backend está rodando.';
      setError(errorMessage); // Define o estado de erro para exibição

      // Remove a mensagem do usuário da conversa se a API falhar (opcional)
      setConversation((prev) => prev.filter(msg => msg.id !== userMessage.id));

      // Mostra notificação de erro
      toast.error("Erro ao Gerar Desculpa", {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      // Finaliza o loading independentemente de sucesso ou erro
      setIsLoading(false);
      // Foca no input novamente usando requestAnimationFrame para garantir que o DOM está pronto
      requestAnimationFrame(() => {
        document.getElementById('problem-input')?.focus();
      });
    }
  };

  // Renderização do componente
  return (
    // Container principal: centraliza, define altura mínima e background
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-bl from-violet-950 via-slate-900 to-indigo-950 p-6 font-sans">

      {/* Seção do Cabeçalho (Agora fora do Card) */}
      <div className="w-full max-w-2xl mb-0"> {/* mb-0 para colar no card abaixo */}
        {/* Div que simula o CardHeader */}
        <div className="border-b border-violet-500/10 p-6 bg-gradient-to-r from-indigo-900/30 to-violet-900/30 rounded-t-3xl"> {/* Arredondado só em cima */}
          <CardTitle className="flex items-center gap-3 text-2xl font-medium text-white">
            {/* Ícone Sparkles */}
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-600/30 text-violet-300 shadow-lg shadow-violet-900/20">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            {/* Título */}
            <span className="bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent">
              DevDesculpas
            </span>
            {/* Badge "AI" */}
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/30 ml-2">
              AI
            </span>
          </CardTitle>
        </div>
      </div>

      {/* Card Principal: Contém o chat e o input */}
      {/* Configurado para ser flexível verticalmente e crescer */}
      {/* Removido max-h-[85vh] */}
      <Card className="w-full max-w-2xl flex flex-col flex-grow bg-black/30 backdrop-blur-xl border border-t-0 border-violet-500/20 rounded-b-3xl overflow-hidden shadow-2xl shadow-violet-700/10 transition-all duration-300 ease-in-out">

        {/* Conteúdo Principal (Área do Chat) */}
        {/* flex-grow faz esta seção expandir, overflow-hidden e relative para a ScrollArea */}
        <CardContent className="flex-grow p-0 overflow-hidden relative">
          {/* ScrollArea ocupa todo o espaço do CardContent */}
          <ScrollArea className="absolute inset-0 w-full h-full" ref={scrollAreaRef}>
            {/* Div interna da ScrollArea com padding e altura mínima */}
            <div className="space-y-6 flex flex-col p-6 min-h-full">

              {/* Mensagem inicial (mostrada apenas se não houver conversa, loading ou erro) */}
              {conversation.length === 0 && !isLoading && !error && (
                <div className="flex flex-col items-center justify-center flex-grow text-indigo-200/60 space-y-4 bg-gradient-to-b from-violet-900/10 to-indigo-900/10 rounded-2xl border border-indigo-500/10 backdrop-blur-sm p-8 mt-auto mb-auto"> {/* Centraliza verticalmente */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600/30 to-indigo-600/30 flex items-center justify-center shadow-lg shadow-violet-900/10">
                    <Sparkles size={28} className="text-violet-300 animate-pulse" />
                  </div>
                  <p className="text-sm font-light text-center max-w-xs">
                    Descreva seu problema de desenvolvimento e receba uma desculpa tecnicamente plausível para impressionar seu chefe
                  </p>
                </div>
              )}

              {/* Mapeamento das Mensagens da Conversa */}
              {conversation.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-4 max-w-[85%] ${
                    message.sender === 'user' ? 'self-end' : 'self-start' // Alinha mensagem
                  }`}
                >
                  {/* Avatar da IA (mostrado se sender for 'ai') */}
                  {message.sender === 'ai' && (
                    <Avatar className="w-10 h-10 ring-2 ring-violet-500/30 flex-shrink-0 shadow-lg">
                      <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
                        <Bot size={18} />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  {/* Balão da Mensagem */}
                  <div
                    className={`rounded-2xl p-5 text-sm shadow-xl break-words backdrop-blur-sm transition-all duration-200 ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-br-none shadow-indigo-900/30' // Estilo usuário
                        : 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-violet-500/20 text-slate-100 rounded-bl-none shadow-violet-900/10' // Estilo IA
                    }`}
                  >
                    {/* Cabeçalho interno da mensagem da IA */}
                    {message.sender === 'ai' && (
                      <div className="flex items-center gap-2 text-xs font-medium pb-3 mb-3 border-b border-violet-500/20 text-violet-300">
                        <Sparkles size={12} className="text-violet-400" />
                        <span>Desculpa Técnica Gerada</span>
                      </div>
                    )}
                    {/* Texto da mensagem */}
                    <div className={message.sender === 'ai' ? 'font-light leading-relaxed' : ''}>{message.text}</div>
                  </div>

                  {/* Avatar do Usuário (mostrado se sender for 'user') */}
                  {message.sender === 'user' && (
                    <Avatar className="w-10 h-10 ring-2 ring-indigo-500/30 flex-shrink-0 shadow-lg">
                      <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
                        <User size={18} />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {/* Indicador de Loading (Skeleton - mostrado durante isLoading) */}
              {isLoading && (
                <div className="flex items-start gap-4 self-start max-w-[85%] mt-1"> {/* Leve margem superior */}
                  <Avatar className="w-10 h-10 ring-2 ring-violet-500/30 flex-shrink-0 shadow-lg">
                    <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
                      <Bot size={18} /> {/* Ícone Bot no skeleton */}
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-2xl p-5 bg-slate-800/40 border border-violet-500/20 w-64 space-y-3 rounded-bl-none shadow-xl backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-xs font-medium pb-3 mb-2 border-b border-violet-500/20 text-violet-300">
                      <Sparkles size={12} className="text-violet-400 animate-pulse" />
                      <span>Gerando desculpa perfeita...</span>
                    </div>
                    <Skeleton className="h-3 w-full bg-violet-500/20 rounded-full" />
                    <Skeleton className="h-3 w-5/6 bg-violet-500/20 rounded-full" />
                    <Skeleton className="h-3 w-4/6 bg-violet-500/20 rounded-full" />
                  </div>
                </div>
              )}

               {/* Mensagem de Erro no Chat (mostrada se houver erro e não estiver carregando) */}
               {error && !isLoading && (
                 <div className="flex items-center gap-3 p-5 rounded-2xl bg-red-900/20 border border-red-500/30 text-red-200 text-sm self-center max-w-[90%] mt-4 backdrop-blur-sm shadow-xl">
                   <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                   <span className="font-light">{error}</span>
                 </div>
               )}
            </div>
          </ScrollArea>
        </CardContent>

        {/* Rodapé do Card (Área de Input) - Fixo na parte inferior devido ao flex-grow do CardContent */}
        <CardFooter className="flex items-center [.border-t]:pt-6 border-t border-violet-500/10 p-6 ">
          <form onSubmit={handleSubmit} className="flex w-full items-center gap-4">
            {/* Input de Texto */}
            <Input
              id="problem-input"
              type="text"
              placeholder="Qual é o seu problema de desenvolvimento hoje?"
              value={problemInput}
              onChange={handleInputChange}
              disabled={isLoading}
              className="flex-1 bg-black/20 backdrop-blur-md border-violet-500/30 text-white placeholder:text-violet-300/50 focus-visible:ring-violet-500/40 focus-visible:ring-offset-0 focus-visible:border-violet-400/50 rounded-xl px-5 py-4 h-14 shadow-inner shadow-violet-950/30 font-light transition-all duration-200"
              autoComplete="off"
            />
            {/* Botão de Envio */}
            <Button
              type="submit"
              disabled={isLoading || !problemInput.trim()}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-xl p-3 h-14 w-14 flex items-center justify-center shadow-lg shadow-violet-700/30 hover:shadow-violet-600/40 hover:scale-105 transition-all duration-200"
              aria-label="Gerar desculpa"
            >
              {/* Mostra spinner ou ícone de envio */}
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Send size={20} />
              )}
            </Button>
          </form>
        </CardFooter>
      </Card> {/* Fim do Card Principal */}

    </div> // Fim do Container Principal da Página
  );
}
