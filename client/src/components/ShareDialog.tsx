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
import { Share2, Lock, Globe, Copy, Check, AlertCircle } from 'lucide-react';

interface ShareDialogProps {
    isOpen: boolean;
    onClose: () => void;
    currentIsPublic: boolean;
    onShare: (isPublic: boolean) => Promise<string | null>;
}

export function ShareDialog({
    isOpen,
    onClose,
    currentIsPublic,
    onShare
}: ShareDialogProps) {
    const [isPublic, setIsPublic] = useState(currentIsPublic);
    const [isSharing, setIsSharing] = useState(false);
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleShare = async () => {
        setIsSharing(true);
        setError(null);
        try {
            const link = await onShare(isPublic);
            if (link) {
                setGeneratedLink(link);
                try {
                    await navigator.clipboard.writeText(link);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                } catch {
                    // clipboard failed silently
                }
            } else {
                setError("Link oluşturulamadı. Lütfen tekrar deneyin.");
            }
        } catch (e) {
            setError(`Hata: ${(e as Error).message}`);
        } finally {
            setIsSharing(false);
        }
    };

    const handleCopy = async () => {
        if (!generatedLink) return;
        try {
            await navigator.clipboard.writeText(generatedLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback: select input text
        }
    };

    const handleClose = () => {
        setGeneratedLink(null);
        setError(null);
        setCopied(false);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
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
                    {generatedLink ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-green-400 font-display">
                                <Check className="w-4 h-4" />
                                Link oluşturuldu!
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={generatedLink}
                                    className="flex-1 bg-background/50 border border-primary/20 rounded px-3 py-2 text-xs font-mono text-foreground select-all"
                                    onFocus={(e) => e.target.select()}
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleCopy}
                                    className="border-primary/30 hover:border-primary shrink-0"
                                >
                                    {copied ? (
                                        <Check className="w-4 h-4 text-green-400" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
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

                            <div className="text-xs text-muted-foreground bg-background/50 p-3 rounded border border-primary/5">
                                <p>
                                    Not: Paylaşım linki oluşturulduktan sonra bu ayarı değiştirmek için sahneyi tekrar paylaşmanız gerekir.
                                </p>
                            </div>
                        </>
                    )}

                    {error && (
                        <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 p-3 rounded border border-destructive/20">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {generatedLink ? (
                        <Button
                            onClick={handleClose}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            Tamam
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                onClick={handleClose}
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
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
