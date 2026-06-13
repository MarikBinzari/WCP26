-- Notificare: regulă nouă diferență de goluri (+10 pts)
-- Rulează DUPĂ ce aplici migrația + select apply_exact_scores()

insert into public.system_notifications (
  title, title_en, title_fr,
  body,  body_en,  body_fr,
  display_date,
  active,
  sort_order
)
values (
  '🆕 Regulă nouă · Scor exact',
  '🆕 New rule · Exact Score',
  '🆕 Nouvelle règle · Score exact',

  'Am adăugat un bonus de +10 puncte pentru diferență de goluri corectă, valabil pe tot parcursul turneului. Dacă ai nimerit câștigătorul meciului și diferența de goluri (dar nu scorul exact), primești puncte suplimentare: la grupe 30 + 10 = 40 pts, la fazele eliminatorii rezultat + 10 pts. Scorul exact rămâne neschimbat și îți aduce cel mai mare bonus. Regula a fost aplicată retroactiv pentru toate meciurile deja jucate.',

  'We''ve added a +10 point bonus for correct goal difference, valid throughout the entire tournament. If you got the match winner and the goal difference right (but not the exact score), you earn extra points: in the group stage 30 + 10 = 40 pts, in the knockout stages result + 10 pts. The exact score remains unchanged and gives the highest bonus. The rule has been applied retroactively to all matches already played.',

  'Nous avons ajouté un bonus de +10 points pour la différence de buts correcte, valable tout au long du tournoi. Si vous avez trouvé le vainqueur du match et la différence de buts (mais pas le score exact), vous obtenez des points supplémentaires : en phase de groupes 30 + 10 = 40 pts, en phases éliminatoires résultat + 10 pts. Le score exact reste inchangé et rapporte le bonus le plus élevé. La règle a été appliquée rétroactivement pour tous les matchs déjà joués.',

  '14 Iun 2026',
  true,
  0
);
