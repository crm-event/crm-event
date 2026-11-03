import FieldError from '@/Components/FieldError';
import CoupleLayout from '@/Layouts/CoupleLayout';
import { focusRing, primaryButton, secondaryButton, textLink } from '@/brand';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

/**
 * Community space shared by all couples: a feed of messages, newest first,
 * each with its replies (one level deep).
 *
 * Couples only see each other's first names. Each couple can delete its own
 * messages; deleting a message also deletes its replies.
 */
export default function Community({ posts, maxBodyLength }) {
    return (
        <CoupleLayout active="community">
            <Head title="Communauté" />

            <p className="text-[11px] uppercase tracking-brand text-sage">
                Entre couples
            </p>

            <h1 className="mt-6 font-display text-3xl leading-snug sm:text-4xl">
                Communauté
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink/70">
                Un espace pour échanger avec les autres couples accompagnés par
                Jessica : idées, bonnes adresses, questions… Seuls vos prénoms
                apparaissent.
            </p>

            <section aria-labelledby="new-post-title" className="mt-12 max-w-2xl">
                <h2 id="new-post-title" className="sr-only">
                    Écrire un message
                </h2>
                <PostComposer maxBodyLength={maxBodyLength} />
            </section>

            <section aria-labelledby="feed-title" className="mt-16 max-w-2xl">
                <h2
                    id="feed-title"
                    className="border-b border-ink/10 pb-4 text-[11px] uppercase tracking-brand text-sage"
                >
                    Derniers messages
                </h2>

                {posts.data.length === 0 ? (
                    <p className="py-12 text-sm leading-relaxed text-ink/60">
                        Aucun message pour l’instant. Soyez les premiers à écrire.
                    </p>
                ) : (
                    <ol className="divide-y divide-ink/10">
                        {posts.data.map((post) => (
                            <li key={post.id} className="py-8">
                                <Post post={post} maxBodyLength={maxBodyLength} />
                            </li>
                        ))}
                    </ol>
                )}

                <FeedPagination posts={posts} />
            </section>
        </CoupleLayout>
    );
}

/**
 * A top-level message, its replies and the reply form.
 */
function Post({ post, maxBodyLength }) {
    const [isReplying, setIsReplying] = useState(false);

    return (
        <article>
            <PostContent post={post} />

            <div className="mt-4 flex items-center gap-6 text-[10px] uppercase tracking-[0.18em] text-sage">
                <button
                    type="button"
                    aria-expanded={isReplying}
                    onClick={() => setIsReplying((wasReplying) => !wasReplying)}
                    className={`${focusRing} uppercase tracking-[0.18em] transition-colors hover:text-ink`}
                >
                    {isReplying ? 'Annuler' : 'Répondre'}
                </button>
                {post.is_own && <DeleteButton post={post} />}
            </div>

            {(post.replies.length > 0 || isReplying) && (
                <div className="mt-6 space-y-6 border-l border-sage/40 pl-6">
                    {post.replies.map((reply) => (
                        <article key={reply.id}>
                            <PostContent post={reply} />
                            {reply.is_own && (
                                <div className="mt-3 text-[10px] uppercase tracking-[0.18em] text-sage">
                                    <DeleteButton post={reply} />
                                </div>
                            )}
                        </article>
                    ))}

                    {isReplying && (
                        <PostComposer
                            parentId={post.id}
                            maxBodyLength={maxBodyLength}
                            onPosted={() => setIsReplying(false)}
                        />
                    )}
                </div>
            )}
        </article>
    );
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
});

/**
 * Author, date and text of a message or reply.
 */
function PostContent({ post }) {
    return (
        <>
            <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="font-display text-lg leading-snug">
                    {post.author ?? 'Un ancien membre'}
                    {post.is_own && (
                        <span className="ml-2 align-middle font-sans text-[10px] uppercase tracking-[0.18em] text-sage">
                            Vous
                        </span>
                    )}
                </p>
                <time dateTime={post.created_at} className="text-xs text-ink/50">
                    {dateFormatter.format(new Date(post.created_at))}
                </time>
            </header>
            <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-ink/80">
                {post.body}
            </p>
        </>
    );
}

/**
 * Form to publish a message, or a reply when `parentId` is given.
 */
function PostComposer({ parentId = null, maxBodyLength, onPosted = () => {} }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        body: '',
        parent_id: parentId,
    });

    const isReply = parentId !== null;
    const fieldId = isReply ? `reply-body-${parentId}` : 'post-body';
    const errorId = `${fieldId}-error`;

    const submit = (e) => {
        e.preventDefault();

        post(route('couple.community.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset('body');
                onPosted();
            },
        });
    };

    return (
        <form onSubmit={submit}>
            <label htmlFor={fieldId} className="sr-only">
                {isReply ? 'Votre réponse' : 'Votre message'}
            </label>
            <textarea
                id={fieldId}
                value={data.body}
                rows={isReply ? 3 : 4}
                maxLength={maxBodyLength}
                autoFocus={isReply}
                required
                placeholder={isReply ? 'Votre réponse…' : 'Partagez une idée, une question, une bonne adresse…'}
                aria-invalid={Boolean(errors.body)}
                aria-describedby={errors.body ? errorId : undefined}
                onChange={(e) => setData('body', e.target.value)}
                className="block w-full resize-y border border-ink/15 bg-white px-4 py-3 text-[15px] leading-relaxed text-ink placeholder:text-ink/35 focus:border-ink focus:ring-0 aria-invalid:border-ink"
            />
            <FieldError id={errorId} message={errors.body ?? errors.parent_id} />

            <div className="mt-4 flex items-center justify-between gap-4">
                <span className="text-xs text-ink/40" aria-live="polite">
                    {data.body.length} / {maxBodyLength}
                </span>
                <button
                    type="submit"
                    disabled={processing}
                    className={`${isReply ? secondaryButton : primaryButton} disabled:cursor-wait disabled:opacity-50`}
                >
                    {processing ? 'Envoi…' : isReply ? 'Répondre' : 'Publier'}
                </button>
            </div>
        </form>
    );
}

/**
 * Deletes one of the couple's own messages, after confirmation.
 */
function DeleteButton({ post }) {
    const deletePost = () => {
        const message = post.replies?.length
            ? 'Supprimer ce message et ses réponses ?'
            : 'Supprimer ce message ?';

        if (window.confirm(message)) {
            router.delete(route('couple.community.destroy', post.id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <button
            type="button"
            onClick={deletePost}
            className={`${focusRing} uppercase tracking-[0.18em] transition-colors hover:text-ink`}
        >
            Supprimer
        </button>
    );
}

/**
 * Links to the newer and older pages of the feed.
 */
function FeedPagination({ posts }) {
    if (!posts.prev_page_url && !posts.next_page_url) {
        return null;
    }

    return (
        <nav
            aria-label="Pages de messages"
            className="mt-8 flex items-center justify-between border-t border-ink/10 pt-6 text-sm"
        >
            {posts.prev_page_url ? (
                <Link href={posts.prev_page_url} className={`${textLink} text-ink/70`}>
                    ← Messages plus récents
                </Link>
            ) : (
                <span />
            )}
            {posts.next_page_url && (
                <Link href={posts.next_page_url} className={`${textLink} text-ink/70`}>
                    Messages plus anciens →
                </Link>
            )}
        </nav>
    );
}
