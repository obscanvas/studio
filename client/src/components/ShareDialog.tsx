/**
 * ShareDialog Component
 * Cyberpunk Control Room - Sahne Paylaşım Dialog'u
 * 
 * Link paylaşırken public/private seçeneği sunar
 */

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Share2, Lock, Globe } from 'lucide-react';

interface ShareDialogProps {
    isOpen: boolean;
    onClose: () => void;
    currentIsPublic: boolean;
    onShare: (isPublic: boolean) => Promise<void>;
}

export function ShareDialog({
    isOpen,
    onClose,
    currentIsPublic,
    onShare
}: ShareDialogProps) {
    const [isPublic, setIsPublic] = useState(currentIsPublic);
    const [isSharing, setIsSharing] = useState(false);

    const handleShare = async () => {
        setIsSharing(true);
        try {
            await onShare(isPublic);
            onClose();
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="cyber-panel bg-card border-primary/30 max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-display text-primary flex items-center gap-2">
                        <Share2 className="w-5 h-5" />
                        Sahneyi Paylaş
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Sahneniz için benzersiz bir paylaşım linki oluşturun.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Public/Private Toggle */}
                    <div className="cyber-panel bg-secondary/20 p-4 rounded-lg border border-primary/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {isPublic ? (
                                    <Globe className="w-5 h-5 text-primary" />
                                ) : (
                                    <Lock className="w-5 h-5 text-muted-foreground" />
                                )}
                                <div>
                                    <Label className="text-sm font-display uppercase tracking-wide">
                                        {isPublic ? 'Herkese Açık' : 'Gizli'}
                                    </Label>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {isPublic
                                            ? 'Linki olan herkes görüntüleyebilir'
                                            : 'Sadece sizin erişebileceğiniz özel sahne'}
                                    </p>
                                </div>
                            </div>
                            <Switch
                                checked={isPublic}
                                onCheckedChange={setIsPublic}
                                className="data-[state=checked]:bg-primary"
                            />
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="text-xs text-muted-foreground bg-background/50 p-3 rounded border border-primary/5">
                        <p>
                            💡 <strong>Not:</strong> Paylaşım linki oluşturulduktan sonra bu ayarı değiştirmek için sahneyi tekrar paylaşmanız gerekir.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="border-primary/30 hover:border-primary hover:bg-primary/10"
                        disabled={isSharing}
                    >
                        İptal
                    </Button>
                    <Button
                        onClick={handleShare}
                        disabled={isSharing}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        {isSharing ? (
                            <>
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                Oluşturuluyor...
                            </>
                        ) : (
                            <>
                                <Share2 className="w-4 h-4 mr-2" />
                                Linki Oluştur
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
