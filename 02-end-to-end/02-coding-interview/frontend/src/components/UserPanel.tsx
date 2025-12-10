import { Users, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Participant } from '@/hooks/useSocketSession';

interface UserPanelProps {
    participants: Participant[];
    onClose: () => void;
}

const UserPanel = ({ participants, onClose }: UserPanelProps) => {
    return (
        <div className="glass-panel w-64 border-l border-border/50 flex flex-col h-full fade-in">
            <div className="flex items-center justify-between p-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm">Participants ({participants.length})</h3>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                    {participants.map((p) => (
                        <div key={p.id} className="flex items-center gap-3 bg-secondary/30 p-2 rounded-lg">
                            <Avatar className="h-8 w-8 border border-border/50">
                                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                    {p.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-medium truncate">{p.name}</span>
                                <span className="text-[10px] text-muted-foreground truncate">ID: {p.id.substring(0, 8)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
};

export default UserPanel;
