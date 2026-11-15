export type DevotionalEmailContent = {
  title: string;
  scripture_reference: string;
  topic: string;
  excerpt: string;
  body: string;
  prayer: string | null;
};

export function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

export function buildDevotionalEmail(
  devotional: DevotionalEmailContent,
  preferencesUrl?: string,
  mailingAddress?: string,
) {
  const paragraphs = devotional.body
    .split(/\n\s*\n/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("");
  const html = [
    `<h1>${escapeHtml(devotional.title)}</h1>`,
    `<p><strong>${escapeHtml(devotional.scripture_reference)}</strong> · ${escapeHtml(devotional.topic)}</p>`,
    `<p>${escapeHtml(devotional.excerpt)}</p>`,
    paragraphs,
    devotional.prayer
      ? `<h2>Closing prayer</h2><p>${escapeHtml(devotional.prayer).replace(/\n/g, "<br />")}</p>`
      : "",
    preferencesUrl
      ? `<hr /><p>You received this email because you confirmed devotional email updates from Pastor K’s Daily Devotional. <a href="${escapeHtml(preferencesUrl)}">Unsubscribe or manage your preferences</a>.</p><p>Pastor K’s Daily Devotional<br />${escapeHtml(mailingAddress ?? "")}</p>`
      : "",
  ].join("");
  const text = [
    devotional.title,
    `${devotional.scripture_reference} · ${devotional.topic}`,
    devotional.excerpt,
    devotional.body,
    devotional.prayer ? `Closing prayer\n${devotional.prayer}` : "",
    preferencesUrl
      ? `You received this email because you confirmed devotional email updates from Pastor K’s Daily Devotional.\nUnsubscribe or manage your preferences: ${preferencesUrl}\n\nPastor K’s Daily Devotional\n${mailingAddress ?? ""}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    subject: `Today's devotional: ${devotional.title}`,
    html,
    text,
  };
}
