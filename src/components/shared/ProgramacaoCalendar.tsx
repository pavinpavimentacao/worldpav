import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  MapPin,
  Users,
  Truck,
  Download,
  Eye
} from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface Programacao {
  id: string;
  data_programacao: string;
  cliente: string;
  obra: string;
  equipe: string;
  localizacao: string;
  maquinarios: string[];
  status: 'agendada' | 'em_andamento' | 'concluida';
}

interface ProgramacaoCalendarProps {
  programacoes: Programacao[];
  onDayClick?: (date: Date) => void;
  onProgramacaoClick?: (programacao: Programacao) => void;
  onExportDay?: (date: Date, programacoes: Programacao[]) => void;
}

export function ProgramacaoCalendar({ 
  programacoes, 
  onDayClick,
  onProgramacaoClick,
  onExportDay
}: ProgramacaoCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const weekStart = startOfWeek(currentDate, { locale: ptBR });
  const weekEnd = endOfWeek(currentDate, { locale: ptBR });

  // Gerar dias da semana
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const nextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  const prevWeek = () => {
    setCurrentDate(addDays(currentDate, -7));
  };

  const today = () => {
    setCurrentDate(new Date());
  };

  const getProgramacoesByDay = (date: Date) => {
    return programacoes.filter(prog => {
      const dataProg = parseISO(prog.data_programacao);
      return isSameDay(date, dataProg);
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendada':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'em_andamento':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'concluida':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'agendada':
        return 'Agendada';
      case 'em_andamento':
        return 'Em Andamento';
      case 'concluida':
        return 'Concluída';
      default:
        return status;
    }
  };

  const handleDayClick = (date: Date) => {
    setSelectedDay(date);
    if (onDayClick) onDayClick(date);
  };

  const handleExportDay = (date: Date) => {
    const programacoesDay = getProgramacoesByDay(date);
    if (onExportDay) onExportDay(date, programacoesDay);
  };

  return (
    <div className="space-y-6">
      {/* Header do Calendário */}
      <Card className="p-6 border-2 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <CalendarIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
              </h2>
              <p className="text-sm text-gray-500">
                Semana de {format(weekStart, 'dd/MM', { locale: ptBR })} a {format(weekEnd, 'dd/MM', { locale: ptBR })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={prevWeek}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={today}>
              Hoje
            </Button>
            <Button variant="outline" size="sm" onClick={nextWeek}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Grid do Calendário */}
        <div className="grid grid-cols-7 gap-3">
          {weekDays.map((day, index) => {
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDay && isSameDay(day, selectedDay);
            const programacoesDay = getProgramacoesByDay(day);
            const hasPrograms = programacoesDay.length > 0;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative"
              >
                <div
                  onClick={() => handleDayClick(day)}
                  className={`
                    relative cursor-pointer rounded-xl border-2 transition-all duration-200
                    ${isSelected 
                      ? 'border-blue-600 bg-blue-50 shadow-lg scale-105' 
                      : isToday
                        ? 'border-blue-400 bg-blue-50'
                        : hasPrograms
                          ? 'border-gray-300 bg-white hover:border-blue-300 hover:shadow-md'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }
                  `}
                >
                  {/* Cabeçalho do Dia */}
                  <div className={`
                    p-3 border-b-2 
                    ${isSelected ? 'border-blue-600 bg-blue-100' : 'border-gray-200'}
                  `}>
                    <div className="text-xs font-medium text-gray-500 uppercase">
                      {format(day, 'EEE', { locale: ptBR })}
                    </div>
                    <div className={`
                      text-2xl font-bold 
                      ${isToday ? 'text-blue-600' : 'text-gray-900'}
                    `}>
                      {format(day, 'dd')}
                    </div>
                  </div>

                  {/* Programações do Dia */}
                  <div className="p-2 space-y-2 min-h-[200px] max-h-[400px] overflow-y-auto">
                    <AnimatePresence>
                      {programacoesDay.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                          Sem programações
                        </div>
                      ) : (
                        programacoesDay.map((prog, idx) => (
                          <motion.div
                            key={prog.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ scale: 1.02 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onProgramacaoClick) onProgramacaoClick(prog);
                            }}
                            className={`
                              p-2 rounded-lg border-l-4 cursor-pointer
                              ${getStatusColor(prog.status)}
                            `}
                          >
                            <div className="space-y-1">
                              <div className="text-xs font-semibold truncate">
                                {prog.obra}
                              </div>
                              <div className="text-xs text-gray-600 truncate">
                                {prog.cliente}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Users className="w-3 h-3" />
                                {prog.equipe}
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {prog.maquinarios.slice(0, 2).map((maq, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs px-1 py-0">
                                    {maq}
                                  </Badge>
                                ))}
                                {prog.maquinarios.length > 2 && (
                                  <Badge variant="secondary" className="text-xs px-1 py-0">
                                    +{prog.maquinarios.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Botão de Exportar (aparece ao hover se tiver programações) */}
                  {hasPrograms && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute bottom-2 right-2"
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportDay(day);
                        }}
                        className="h-7 w-7 p-0 bg-white/90 backdrop-blur-sm"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </motion.div>
                  )}

                  {/* Badge de contagem */}
                  {hasPrograms && (
                    <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
                      {programacoesDay.length}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Legenda */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-300"></div>
          <span className="text-gray-600">Agendada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-100 border-2 border-yellow-300"></div>
          <span className="text-gray-600">Em Andamento</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-300"></div>
          <span className="text-gray-600">Concluída</span>
        </div>
      </div>
    </div>
  );
}

