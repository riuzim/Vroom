import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, Send, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { FEEDBACK_CATEGORIES, FEEDBACK_IMAGE_MAX_BYTES } from '@vroom/shared';
import { api, apiErrorMessage, apiUrl } from '@/lib/api';
import { useMe } from '@/hooks/useAuth';
import { useFeedbackUnseen } from '@/hooks/useFeedbackUnseen';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const CATEGORY_BADGE = {
  OPINION: 'border-bone/30 text-bone/70',
  BUG: 'border-danger/60 text-danger',
  IMPROVEMENT: 'border-acid/60 text-acid',
};

/**
 * Print anexado. <img> cross-origin não leva o cookie de sessão, então o
 * download passa por fetch (credentials: include) e vira objectURL local.
 */
function FeedbackImage({ id, alt }) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    let objectUrl;
    let cancelled = false;

    fetch(apiUrl(`/api/feedback/${id}/image`), { credentials: 'include' })
      .then((response) => (response.ok ? response.blob() : null))
      .then((blob) => {
        if (blob && !cancelled) {
          objectUrl = URL.createObjectURL(blob);
          setSrc(objectUrl);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [id]);

  if (!src) {
    return null;
  }

  return (
    <img
      src={src}
      alt={alt}
      className="mt-3 max-h-80 w-full rounded-md border border-bone/10 bg-ink object-contain"
    />
  );
}

function FeedbackForm() {
  const { t } = useTranslation();
  const [category, setCategory] = useState('OPINION');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null); // { data, mime, dataUrl }
  const [sending, setSending] = useState(false);
  const fileRef = useRef(null);

  function handleFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      toast.error(t('feedback.imageInvalid'));
      return;
    }

    if (file.size > FEEDBACK_IMAGE_MAX_BYTES) {
      toast.error(t('feedback.imageTooLarge'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      const [, data] = dataUrl.split(',');
      setImage({ data, mime: file.type, dataUrl });
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSending(true);
    try {
      await api.post('/api/feedback', {
        category,
        title,
        content,
        image: image ? { data: image.data, mime: image.mime } : undefined,
      });
      toast.success(t('feedback.sent'));
      setTitle('');
      setContent('');
      setImage(null);
    } catch (error) {
      toast.error(apiErrorMessage(t, error));
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="mb-2 font-display text-xs font-semibold uppercase tracking-widest text-bone/55">
          {t('feedback.categoryLabel')}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {FEEDBACK_CATEGORIES.map((item) => (
            <Button
              key={item}
              type="button"
              variant={category === item ? 'default' : 'outline'}
              onClick={() => setCategory(item)}
              className="w-full"
            >
              {t(`feedback.categories.${item}`)}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="feedback-title"
          className="mb-2 block font-display text-xs font-semibold uppercase tracking-widest text-bone/55"
        >
          {t('feedback.titleLabel')}
        </label>
        <Input
          id="feedback-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={t('feedback.titlePlaceholder')}
          maxLength={120}
          required
        />
      </div>

      <div>
        <label
          htmlFor="feedback-content"
          className="mb-2 block font-display text-xs font-semibold uppercase tracking-widest text-bone/55"
        >
          {t('feedback.contentLabel')}
        </label>
        <Textarea
          id="feedback-content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder={t('feedback.contentPlaceholder')}
          maxLength={4000}
          required
        />
      </div>

      <div>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFile}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
            <ImagePlus className="size-4" />
            {t('feedback.attach')}
          </Button>
          {image && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setImage(null)}
              className="text-bone/60"
            >
              <X className="size-4" />
              {t('feedback.removeImage')}
            </Button>
          )}
        </div>
        {image && (
          <img
            src={image.dataUrl}
            alt={t('feedback.attach')}
            className="mt-3 max-h-64 w-full rounded-md border border-bone/10 object-contain"
          />
        )}
      </div>

      <Button type="submit" className="w-full" disabled={sending}>
        <Send className="size-4" />
        {sending ? t('feedback.sending') : t('feedback.send')}
      </Button>

      {/* Aviso LGPD: coleta + retenção do que o formulário envia (issue #52). */}
      <p className="text-xs leading-relaxed text-bone/50">
        {t('feedback.dataNotice')}
        <Link to="/privacidade" className="underline underline-offset-2 hover:text-bone/80">
          {t('feedback.dataNoticeLink')}
        </Link>
        {t('feedback.dataNoticeEnd')}
      </p>
    </form>
  );
}

function AdminInbox() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('ALL');
  const [armedId, setArmedId] = useState(null);
  const [removing, setRemoving] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['feedback'],
    queryFn: () => api.get('/api/feedback'),
    staleTime: 30_000,
  });

  const feedbacks = data?.feedbacks ?? [];
  const visible =
    filter === 'ALL' ? feedbacks : feedbacks.filter((item) => item.category === filter);

  async function handleMarkRead(id) {
    if (armedId !== id) {
      setArmedId(id);
      return;
    }

    setRemoving(true);
    try {
      await api.del(`/api/feedback/${id}`);
      toast.success(t('feedback.markedRead'));
      setArmedId(null);
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      // Apagar um feedback novo também muda a contagem do sino.
      queryClient.invalidateQueries({ queryKey: ['feedback-summary'] });
    } catch (error) {
      toast.error(apiErrorMessage(t, error));
    } finally {
      setRemoving(false);
    }
  }

  const filters = ['ALL', ...FEEDBACK_CATEGORIES];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {filters.map((item) => (
          <Button
            key={item}
            type="button"
            variant={filter === item ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(item)}
            className="font-display text-xs font-semibold uppercase"
          >
            {item === 'ALL' ? t('feedback.filterAll') : t(`feedback.categories.${item}`)}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} className="h-28 w-full" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-sm text-bone/60">{t('feedback.adminError')}</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-bone/60">{t('feedback.adminEmpty')}</p>
      ) : (
        <ul className="space-y-3">
          {visible.map((item) => (
            <Card key={item.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Badge variant="outline" className={cn('mb-2', CATEGORY_BADGE[item.category])}>
                    {t(`feedback.categories.${item.category}`)}
                  </Badge>
                  <h3 className="font-display text-base font-semibold text-bone">{item.title}</h3>
                  <p className="mt-0.5 text-xs text-bone/50">
                    {item.author ?? t('feedback.anonymous')} ·{' '}
                    {new Date(item.createdAt).toLocaleDateString(i18n.resolvedLanguage)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMarkRead(item.id)}
                  disabled={removing && armedId === item.id}
                  className={cn(
                    'shrink-0 text-bone/60',
                    armedId === item.id && 'text-danger hover:text-danger',
                  )}
                >
                  <Trash2 className="size-4" />
                  {armedId === item.id ? t('feedback.confirmRead') : t('feedback.markRead')}
                </Button>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-bone/80">{item.content}</p>
              {item.hasImage && <FeedbackImage id={item.id} alt={t('feedback.attach')} />}
            </Card>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Feedback() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data } = useMe();
  const isAdmin = data?.user?.isAdmin ?? false;
  const { unseen } = useFeedbackUnseen(isAdmin);
  const [tab, setTab] = useState('send');

  usePageMeta({
    title: t('feedback.metaTitle'),
    description: t('feedback.metaDescription'),
  });

  /**
   * Abrir a caixa de entrada "vê" tudo: zera o sino no servidor e
   * invalida o ['feedback-summary'] — o Header (mesma queryKey) some
   * com a bolinha na hora. Falha aqui é só cosmética: a caixa segue
   * funcionando com os dados da lista.
   */
  async function handleTabChange(value) {
    setTab(value);

    if (value === 'inbox') {
      try {
        await api.post('/api/feedback/seen', {});
        queryClient.invalidateQueries({ queryKey: ['feedback-summary'] });
      } catch {
        // Silencioso de propósito — ver acima.
      }
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold uppercase tracking-[0.18em] text-bone">
        {t('feedback.title')}
      </h1>
      <p className="mt-2 text-sm text-bone/60">{t('feedback.subtitle')}</p>

      <Card className="mt-6 p-6">
        {isAdmin ? (
          <Tabs value={tab} onValueChange={handleTabChange}>
            <TabsList className="mb-4">
              <TabsTrigger value="send">{t('feedback.send')}</TabsTrigger>
              <TabsTrigger value="inbox" className="gap-1.5">
                {t('feedback.adminTab')}
                {unseen > 0 && (
                  <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-danger px-1.5 py-0.5 text-[10px] font-bold leading-none text-bone">
                    {unseen > 99 ? '99+' : unseen}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="send">
              <FeedbackForm />
            </TabsContent>
            <TabsContent value="inbox">
              <AdminInbox />
            </TabsContent>
          </Tabs>
        ) : (
          <FeedbackForm />
        )}
      </Card>
    </main>
  );
}
