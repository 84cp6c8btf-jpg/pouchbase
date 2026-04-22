-- PouchBase Review Expansion
-- Adds 7 new demo reviewers and reviews across ALL products.
-- Safe to run multiple times (upserts on product_id + user_id).

create extension if not exists pgcrypto;

-- ============================================
-- NEW DEMO REVIEWER ACCOUNTS
-- ============================================
with seed_users (email, full_name) as (
  values
    ('pouchwizard@pouchbase.local', 'Pouch Wizard'),
    ('frostbitelou@pouchbase.local', 'Frostbite Lou'),
    ('snusviking@pouchbase.local', 'Snus Viking'),
    ('nicnerd@pouchbase.local', 'Nic Nerd'),
    ('flavorhunter@pouchbase.local', 'Flavor Hunter'),
    ('tincanreview@pouchbase.local', 'Tin Can Review'),
    ('dailypoucher@pouchbase.local', 'Daily Poucher')
)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
)
select
  '00000000-0000-0000-0000-000000000000'::uuid,
  gen_random_uuid(), 'authenticated', 'authenticated', su.email,
  crypt('temporary-demo-only', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', su.full_name, 'name', su.full_name),
  now(), now(), '', '', '', ''
from seed_users su
where not exists (select 1 from auth.users u where u.email = su.email);

-- Update display names
with seed_users (email, full_name) as (
  values
    ('pouchwizard@pouchbase.local', 'Pouch Wizard'),
    ('frostbitelou@pouchbase.local', 'Frostbite Lou'),
    ('snusviking@pouchbase.local', 'Snus Viking'),
    ('nicnerd@pouchbase.local', 'Nic Nerd'),
    ('flavorhunter@pouchbase.local', 'Flavor Hunter'),
    ('tincanreview@pouchbase.local', 'Tin Can Review'),
    ('dailypoucher@pouchbase.local', 'Daily Poucher')
)
update profiles p
set display_name = su.full_name
from seed_users su
join auth.users u on u.email = su.email
where p.id = u.id;

-- ============================================
-- REVIEWS FOR ALL PRODUCTS
-- ============================================
with seed_reviews (product_slug, reviewer_email, burn_rating, flavor_rating, longevity_rating, overall_rating, review_text) as (
  values
    -- ===================== ORIGINAL 14 PRODUCTS (additional reviews) =====================

    -- ZYN Cool Mint Mini 3mg
    ('zyn-cool-mint-mini-3mg', 'dailypoucher@pouchbase.local', 3, 8, 7, 7, 'My go-to work pouch. Zero drama, clean mint, and I can use it in meetings without anyone noticing.'),
    ('zyn-cool-mint-mini-3mg', 'pouchwizard@pouchbase.local', 2, 7, 6, 7, 'About as mild as it gets. Good starter pouch but veterans will want more kick.'),

    -- ZYN Citrus Mini 6mg
    ('zyn-citrus-mini-6mg', 'flavorhunter@pouchbase.local', 4, 8, 6, 7, 'The citrus actually tastes real, not artificial. Nice change from mint everything.'),
    ('zyn-citrus-mini-6mg', 'nicnerd@pouchbase.local', 3, 7, 7, 7, 'Solid mid-strength option. The dry format means less drip which I appreciate.'),

    -- VELO Freeze Max 17mg
    ('velo-freeze-max-17mg', 'snusviking@pouchbase.local', 9, 7, 8, 8, 'Hits like a freight train of menthol. Not for the faint of heart but exactly what strong users want.'),
    ('velo-freeze-max-17mg', 'frostbitelou@pouchbase.local', 8, 8, 8, 8, 'My daily driver when I need something serious. The freeze effect is legit.'),

    -- VELO Lime Flame 10mg
    ('velo-lime-flame-10mg', 'flavorhunter@pouchbase.local', 6, 9, 7, 8, 'Best lime pouch on the market. The flavor is spot on and the strength is goldilocks.'),
    ('velo-lime-flame-10mg', 'dailypoucher@pouchbase.local', 7, 8, 7, 8, 'Really nice balance. Not too strong, great flavor, and the burn adds character.'),

    -- LOOP Jalapeno Lime Strong
    ('loop-jalapeno-lime-strong', 'flavorhunter@pouchbase.local', 7, 10, 8, 9, 'This is what innovation looks like. Actual chili heat in a pouch. Incredible.'),
    ('loop-jalapeno-lime-strong', 'snusviking@pouchbase.local', 8, 8, 7, 8, 'Strange combo that somehow works. The jalapeno is subtle but unmistakable.'),

    -- LOOP Mint Mania Hyper Strong
    ('loop-mint-mania-hyper-strong', 'frostbitelou@pouchbase.local', 8, 8, 9, 8, 'Wet format means faster release. This thing kicks in within 30 seconds.'),
    ('loop-mint-mania-hyper-strong', 'pouchwizard@pouchbase.local', 8, 7, 8, 8, 'Strong and minty. Nothing revolutionary but executed really well.'),

    -- Pablo Ice Cold 30mg
    ('pablo-ice-cold-30mg', 'snusviking@pouchbase.local', 10, 7, 9, 8, 'You know what youre signing up for with Pablo. Absolute unit of a pouch.'),
    ('pablo-ice-cold-30mg', 'nicnerd@pouchbase.local', 9, 6, 8, 7, 'Too strong for daily use but perfect when you need that nuclear option.'),

    -- Pablo Red 24mg
    ('pablo-red-24mg', 'pouchwizard@pouchbase.local', 9, 7, 8, 8, 'The cherry flavor is better than expected. Still punches way above most brands.'),
    ('pablo-red-24mg', 'frostbitelou@pouchbase.local', 8, 8, 7, 7, 'Surprisingly tasty for a super-strong. The fruit makes the strength more bearable.'),

    -- Siberia Extremely Strong Slim
    ('siberia-extremely-strong-slim', 'snusviking@pouchbase.local', 10, 6, 9, 8, 'The legend. Still the most intense pouch experience money can buy.'),
    ('siberia-extremely-strong-slim', 'tincanreview@pouchbase.local', 10, 5, 9, 7, 'Respect it but cant use it daily. The 43mg is genuinely overwhelming.'),

    -- White Fox Full Charge
    ('white-fox-full-charge', 'dailypoucher@pouchbase.local', 7, 8, 8, 8, 'Premium feel all around. The tin, the pouch, the flavor. Worth the price.'),
    ('white-fox-full-charge', 'flavorhunter@pouchbase.local', 7, 9, 8, 9, 'Best peppermint pouch period. Clean, strong enough, and lasts forever.'),

    -- KILLA Cold Mint
    ('killa-cold-mint', 'frostbitelou@pouchbase.local', 9, 7, 7, 8, 'Fast hitting and icy. The lip burn is real but thats part of the appeal.'),
    ('killa-cold-mint', 'tincanreview@pouchbase.local', 8, 8, 8, 8, 'Better quality than the price suggests. Solid strong mint option.'),

    -- KILLA Blueberry
    ('killa-blueberry', 'flavorhunter@pouchbase.local', 7, 9, 7, 8, 'Genuinely tastes like blueberry, not just generic berry. Nice surprise.'),
    ('killa-blueberry', 'dailypoucher@pouchbase.local', 7, 8, 7, 8, 'Good fruit option if you want something strong but not mint.'),

    -- XQS Tropical Strong
    ('xqs-tropical-strong', 'flavorhunter@pouchbase.local', 5, 9, 7, 8, 'The tropical flavor is complex and interesting. Not just pineapple slapped on nicotine.'),
    ('xqs-tropical-strong', 'pouchwizard@pouchbase.local', 5, 8, 7, 8, 'Underrated brand. This is genuinely one of the best fruit pouches available.'),

    -- ACE Spearmint
    ('ace-spearmint', 'dailypoucher@pouchbase.local', 6, 8, 7, 8, 'Reliable and consistent. Nothing exciting but nothing wrong either.'),
    ('ace-spearmint', 'nicnerd@pouchbase.local', 5, 8, 8, 8, 'Clean Scandinavian design and clean flavor to match. Solid choice.'),

    -- ===================== EXPANSION PRODUCTS =====================

    -- ZYN Spearmint 6mg
    ('zyn-spearmint-6mg', 'mintledger@pouchbase.local', 4, 8, 7, 8, 'Sweeter than Cool Mint. Nice option when you want something gentler.'),
    ('zyn-spearmint-6mg', 'dailypoucher@pouchbase.local', 3, 8, 7, 7, 'Classic ZYN quality. Dry format, clean release, no complaints.'),
    ('zyn-spearmint-6mg', 'flavorhunter@pouchbase.local', 4, 7, 6, 7, 'Decent but I prefer the Cool Mint. This one is a bit too sweet for me.'),

    -- ZYN Espressino 6mg
    ('zyn-espressino-6mg', 'nicnerd@pouchbase.local', 3, 8, 6, 7, 'Finally a coffee pouch that actually tastes like coffee. Not just vague brown flavor.'),
    ('zyn-espressino-6mg', 'tincanreview@pouchbase.local', 3, 7, 6, 7, 'Interesting change of pace. Works surprisingly well after an actual espresso.'),

    -- ZYN Cool Mint Strong 9mg
    ('zyn-cool-mint-strong-9mg', 'burnchaser@pouchbase.local', 5, 8, 7, 8, 'The bump from 3mg to 9mg is very noticeable. Good stepping stone to stronger stuff.'),
    ('zyn-cool-mint-strong-9mg', 'frostbitelou@pouchbase.local', 5, 8, 7, 8, 'Perfect middle ground. Not too mild, not skull-crushing. Daily driver material.'),
    ('zyn-cool-mint-strong-9mg', 'pouchwizard@pouchbase.local', 5, 8, 7, 8, 'The strong version is what the 3mg should have been from the start.'),

    -- ZYN Bellini 6mg
    ('zyn-bellini-6mg', 'flavorhunter@pouchbase.local', 3, 8, 6, 7, 'Peachy and sweet. Fun flavor but might get old after a full can.'),
    ('zyn-bellini-6mg', 'dailypoucher@pouchbase.local', 3, 7, 5, 7, 'Novel concept but I went back to mint after a few pouches.'),

    -- VELO Ice Cool 10mg
    ('velo-ice-cool-10mg', 'frostbitelou@pouchbase.local', 6, 8, 7, 8, 'Clean cooling without the chaos of Freeze Max. Great daily option.'),
    ('velo-ice-cool-10mg', 'mintledger@pouchbase.local', 6, 7, 8, 7, 'Standard VELO quality. Does the job without drama.'),

    -- VELO Berry Frost 10mg
    ('velo-berry-frost-10mg', 'flavorhunter@pouchbase.local', 6, 9, 7, 8, 'The berry-mint combo is chef kiss. Best VELO flavor in my opinion.'),
    ('velo-berry-frost-10mg', 'dailypoucher@pouchbase.local', 5, 8, 7, 8, 'Sweet but not cloying. The frost finish saves it from being too candy-like.'),

    -- VELO Tropic Breeze 6mg
    ('velo-tropic-breeze-6mg', 'pouchwizard@pouchbase.local', 3, 8, 6, 7, 'Light and fruity. Perfect for when you want nicotine but dont want to think about it.'),
    ('velo-tropic-breeze-6mg', 'flavorhunter@pouchbase.local', 3, 8, 7, 8, 'Surprisingly good. The tropical flavors blend well and its very smooth.'),

    -- VELO Ruby Berry 17mg
    ('velo-ruby-berry-17mg', 'burnchaser@pouchbase.local', 8, 7, 8, 8, 'Dark berry with real strength behind it. VELO doesnt mess around at 17mg.'),
    ('velo-ruby-berry-17mg', 'snusviking@pouchbase.local', 8, 8, 7, 8, 'Strong fruit option that actually delivers. The throat hit is significant.'),

    -- LOOP Red Chili Melon Strong
    ('loop-red-chili-melon-strong', 'burnchaser@pouchbase.local', 7, 9, 7, 8, 'LOOP keeps innovating. The chili is subtle but you definitely feel the warmth.'),
    ('loop-red-chili-melon-strong', 'flavorhunter@pouchbase.local', 7, 9, 7, 9, 'Watermelon and chili shouldnt work but LOOP made it happen.'),

    -- LOOP Sicily Spritz Strong
    ('loop-sicily-spritz-strong', 'nicnerd@pouchbase.local', 5, 9, 7, 8, 'Tastes like a cocktail in pouch form. Very sophisticated for this category.'),
    ('loop-sicily-spritz-strong', 'flavorhunter@pouchbase.local', 6, 9, 7, 9, 'Blood orange and bitter notes. This is what premium pouch flavor should be.'),

    -- LOOP Salty Ludicris
    ('loop-salty-ludicris', 'snusviking@pouchbase.local', 9, 8, 8, 8, 'If you grew up on salmiak this is heaven. Everyone else will hate it.'),
    ('loop-salty-ludicris', 'burnchaser@pouchbase.local', 8, 6, 8, 7, 'Way too salty for me but the nicotine delivery is excellent.'),

    -- Pablo Banana Ice 30mg
    ('pablo-banana-ice-30mg', 'burnchaser@pouchbase.local', 9, 7, 8, 8, 'Pablo does banana surprisingly well. Still brutal on the lip though.'),
    ('pablo-banana-ice-30mg', 'snusviking@pouchbase.local', 9, 8, 8, 8, 'Sweet banana flavor helps mask the extreme nicotine. Clever move.'),

    -- Pablo Mango Ice 30mg
    ('pablo-mango-ice-30mg', 'frostbitelou@pouchbase.local', 9, 8, 8, 8, 'Best mango pouch in the strong category. The ice balances the sweetness.'),
    ('pablo-mango-ice-30mg', 'tincanreview@pouchbase.local', 9, 7, 8, 7, 'Good flavor for a 30mg but still not something I can use more than once a day.'),

    -- Pablo Frosted Mint 50mg
    ('pablo-frosted-mint-50mg', 'snusviking@pouchbase.local', 10, 7, 9, 8, 'Absolutely insane. This is not for humans. I love it.'),
    ('pablo-frosted-mint-50mg', 'burnchaser@pouchbase.local', 10, 6, 9, 7, 'Used this once and had to sit down. Respect the 50mg.'),
    ('pablo-frosted-mint-50mg', 'nicnerd@pouchbase.local', 10, 6, 8, 7, 'Medically inadvisable but undeniably impressive. The burn is nuclear.'),

    -- KILLA Watermelon
    ('killa-watermelon', 'flavorhunter@pouchbase.local', 8, 8, 7, 8, 'Sweet watermelon with genuine KILLA strength. Good summer pouch.'),
    ('killa-watermelon', 'dailypoucher@pouchbase.local', 8, 8, 7, 8, 'Better than expected. The watermelon doesnt taste artificial.'),

    -- KILLA Apple
    ('killa-apple', 'nicnerd@pouchbase.local', 8, 8, 7, 8, 'Sour green apple works great with strong nicotine. Refreshing and punchy.'),
    ('killa-apple', 'pouchwizard@pouchbase.local', 8, 7, 7, 7, 'Decent apple flavor. Nothing special but KILLA strength is always reliable.'),

    -- KILLA Banana Ice
    ('killa-banana-ice', 'flavorhunter@pouchbase.local', 8, 9, 7, 8, 'Best banana pouch Ive tried. The ice component elevates it above candy territory.'),
    ('killa-banana-ice', 'burnchaser@pouchbase.local', 7, 8, 7, 8, 'Smooth for a KILLA. The banana sweetness takes the edge off the burn.'),

    -- White Fox Double Mint
    ('white-fox-double-mint', 'mintledger@pouchbase.local', 6, 9, 8, 8, 'Two-layer mint is not just marketing. You can genuinely taste the difference.'),
    ('white-fox-double-mint', 'dailypoucher@pouchbase.local', 5, 8, 8, 8, 'Premium quality as always from White Fox. My favorite in their lineup.'),

    -- White Fox Peppered Mint
    ('white-fox-peppered-mint', 'snusviking@pouchbase.local', 8, 8, 8, 8, 'The pepper note is subtle but adds real complexity. Not just another mint pouch.'),
    ('white-fox-peppered-mint', 'burnchaser@pouchbase.local', 8, 7, 8, 8, 'Strong and interesting. The black pepper spice works surprisingly well.'),

    -- XQS Elderflower
    ('xqs-elderflower', 'flavorhunter@pouchbase.local', 4, 10, 7, 9, 'This is the most unique pouch Ive ever tried. Delicate floral notes done perfectly.'),
    ('xqs-elderflower', 'nicnerd@pouchbase.local', 4, 8, 7, 8, 'Not for everyone but if you like elderflower drinks youll love this.'),

    -- XQS Blueberry Mint
    ('xqs-blueberry-mint', 'dailypoucher@pouchbase.local', 5, 9, 7, 8, 'Great dual flavor execution. Neither the berry nor mint overpowers the other.'),
    ('xqs-blueberry-mint', 'pouchwizard@pouchbase.local', 4, 8, 7, 8, 'Smooth and tasty. XQS consistently underrated in the pouch game.'),

    -- ACE Cool Eucalyptus
    ('ace-cool-eucalyptus', 'mintledger@pouchbase.local', 5, 8, 8, 8, 'Different from mint in a good way. The eucalyptus feels more herbal and natural.'),
    ('ace-cool-eucalyptus', 'tincanreview@pouchbase.local', 6, 8, 7, 8, 'Unique flavor profile that sets ACE apart. Very refreshing.'),

    -- ACE Citrus
    ('ace-citrus', 'dailypoucher@pouchbase.local', 3, 8, 6, 7, 'Light and lemony. Perfect office pouch for people who dont want to think about strength.'),
    ('ace-citrus', 'flavorhunter@pouchbase.local', 2, 8, 6, 7, 'Very mild. Good for complete beginners or light daily use.'),

    -- Nordic Spirit Mint
    ('nordic-spirit-mint', 'mintledger@pouchbase.local', 5, 8, 7, 8, 'Reliable gas station buy across Europe. Always consistent quality.'),
    ('nordic-spirit-mint', 'dailypoucher@pouchbase.local', 5, 7, 7, 7, 'Nothing exciting but always available and always decent.'),
    ('nordic-spirit-mint', 'tincanreview@pouchbase.local', 5, 7, 7, 7, 'The Ford Fiesta of nicotine pouches. Gets the job done.'),

    -- Nordic Spirit Bergamot Wildberry
    ('nordic-spirit-bergamot-wildberry', 'flavorhunter@pouchbase.local', 5, 9, 7, 8, 'Earl Grey meets berries. This is genuinely creative and well executed.'),
    ('nordic-spirit-bergamot-wildberry', 'nicnerd@pouchbase.local', 4, 8, 7, 8, 'The bergamot note is real and sophisticated. Unexpected from a mainstream brand.'),

    -- Nordic Spirit Watermelon
    ('nordic-spirit-watermelon', 'dailypoucher@pouchbase.local', 3, 8, 7, 8, 'Sweet and easy. Good for summer. Lower strength keeps it casual.'),
    ('nordic-spirit-watermelon', 'pouchwizard@pouchbase.local', 4, 8, 6, 7, 'Pleasant watermelon but fades quicker than I would like.'),

    -- Nordic Spirit Mocha
    ('nordic-spirit-mocha', 'nicnerd@pouchbase.local', 4, 7, 6, 7, 'Coffee chocolate vibes. Interesting but slightly artificial tasting.'),
    ('nordic-spirit-mocha', 'tincanreview@pouchbase.local', 3, 7, 6, 7, 'A for effort on the flavor but the ZYN Espressino does coffee better.'),

    -- Helwit Mint
    ('helwit-mint', 'dailypoucher@pouchbase.local', 2, 8, 6, 7, 'Perfect for light users. Very gentle but the mint flavor is genuine.'),
    ('helwit-mint', 'mintledger@pouchbase.local', 2, 7, 6, 7, 'Good stepping stone for people trying to reduce their nicotine intake.'),

    -- Helwit Banana
    ('helwit-banana', 'flavorhunter@pouchbase.local', 2, 8, 5, 7, 'Sweet and mild. Like a banana candy with barely any nicotine.'),
    ('helwit-banana', 'pouchwizard@pouchbase.local', 1, 8, 6, 7, 'Probably the mildest pouch in existence. Good if thats what you want.'),

    -- Helwit Violet
    ('helwit-violet', 'flavorhunter@pouchbase.local', 1, 9, 5, 8, 'Wild card flavor that actually delivers. Floral and delicate.'),
    ('helwit-violet', 'nicnerd@pouchbase.local', 2, 8, 5, 7, 'Never seen violet flavor anywhere else. Points for originality.'),

    -- Skruf Fresh Mint #3
    ('skruf-fresh-mint-3', 'mintledger@pouchbase.local', 5, 8, 7, 8, 'Old school Skruf quality in a modern package. Very reliable.'),
    ('skruf-fresh-mint-3', 'dailypoucher@pouchbase.local', 4, 8, 7, 7, 'Clean mint, medium strength, good value. What more do you need.'),

    -- Skruf Frozen Shot #5
    ('skruf-frozen-shot-5', 'frostbitelou@pouchbase.local', 8, 7, 8, 8, 'Skruf brings their heritage quality to the extra strong game. Very well done.'),
    ('skruf-frozen-shot-5', 'burnchaser@pouchbase.local', 8, 7, 8, 8, 'Strong frozen mint with better quality than most competitors at this level.'),

    -- Skruf Blackcurrant #3
    ('skruf-blackcurrant-3', 'flavorhunter@pouchbase.local', 4, 9, 7, 8, 'Tart and natural tasting. Not candy-like at all which I really appreciate.'),
    ('skruf-blackcurrant-3', 'nicnerd@pouchbase.local', 4, 8, 7, 8, 'One of the more authentic fruit flavors out there. Skruf nailed this.'),

    -- Dope Freeze Crazy Strong
    ('dope-freeze-crazy-strong', 'snusviking@pouchbase.local', 9, 7, 8, 8, 'Living up to the name. Crazy strong is an understatement at 28mg.'),
    ('dope-freeze-crazy-strong', 'burnchaser@pouchbase.local', 10, 7, 8, 7, 'Extreme cooling and extreme nicotine. Not for daily use unless youre built different.'),

    -- Dope Lime Smash
    ('dope-lime-smash', 'flavorhunter@pouchbase.local', 8, 8, 7, 8, 'Zesty lime with a strong backbone. The smash name fits perfectly.'),
    ('dope-lime-smash', 'pouchwizard@pouchbase.local', 7, 8, 7, 8, 'Better lime flavor than most competitors. Dope doesnt get enough credit.'),

    -- On! Coffee 6mg
    ('on-coffee-6mg', 'nicnerd@pouchbase.local', 3, 7, 5, 7, 'Tiny pouch, decent coffee flavor. Completely invisible under the lip.'),
    ('on-coffee-6mg', 'tincanreview@pouchbase.local', 2, 7, 5, 7, 'The mini format is hit or miss. Less flavor but maximum discretion.'),

    -- On! Mint 8mg
    ('on-mint-8mg', 'mintledger@pouchbase.local', 3, 7, 6, 7, 'Good for when you need something truly invisible. Office power move.'),
    ('on-mint-8mg', 'dailypoucher@pouchbase.local', 3, 7, 6, 7, 'Small but effective. The dry format means zero drip.'),

    -- On! Berry 4mg
    ('on-berry-4mg', 'flavorhunter@pouchbase.local', 2, 8, 5, 7, 'Sweet berry in the tiniest format. Good entry pouch for cautious first timers.'),
    ('on-berry-4mg', 'pouchwizard@pouchbase.local', 1, 7, 5, 7, 'Barely any nicotine sensation. The berry flavor is the main event.'),

    -- Iceberg Lemon Extra Strong
    ('iceberg-lemon-extra-strong', 'burnchaser@pouchbase.local', 9, 8, 8, 8, 'Sour lemon and strong nicotine. Feels like a lemon drop candy that fights back.'),
    ('iceberg-lemon-extra-strong', 'flavorhunter@pouchbase.local', 8, 8, 7, 8, 'One of the better lemon flavors in the strong category. Properly sour.'),

    -- Iceberg Grape Extra Strong
    ('iceberg-grape-extra-strong', 'snusviking@pouchbase.local', 8, 7, 7, 7, 'Grape candy vibes with serious strength. Not subtle but effective.'),
    ('iceberg-grape-extra-strong', 'tincanreview@pouchbase.local', 8, 7, 8, 7, 'Strong and sweet. The grape flavor holds up better than expected.'),

    -- Kurwa Fatality Grape Ice
    ('kurwa-fatality-grape-ice', 'snusviking@pouchbase.local', 10, 7, 9, 7, 'At 47mg this is in truly insane territory. Proceed with extreme caution.'),
    ('kurwa-fatality-grape-ice', 'burnchaser@pouchbase.local', 10, 7, 8, 7, 'The name is accurate. This is a fatality-level pouch. Respect it or suffer.'),

    -- Kurwa Fatality Strawberry Ice
    ('kurwa-fatality-strawberry-ice', 'burnchaser@pouchbase.local', 10, 7, 8, 7, 'Sweet strawberry disguising absolute mayhem. The ice doesnt cool the fire.'),
    ('kurwa-fatality-strawberry-ice', 'snusviking@pouchbase.local', 10, 7, 9, 8, 'If you survive the first 5 minutes the strawberry flavor is actually decent.'),

    -- Volt Dark Frost
    ('volt-dark-frost', 'mintledger@pouchbase.local', 6, 8, 8, 8, 'Dark mint flavor is richer and deeper than typical mint. Really enjoy this.'),
    ('volt-dark-frost', 'dailypoucher@pouchbase.local', 6, 8, 7, 8, 'Swedish Match quality at a reasonable price. Underrated brand.'),

    -- Volt Pearls Spearmint
    ('volt-pearls-spearmint', 'pouchwizard@pouchbase.local', 3, 8, 7, 7, 'Light and fresh. Good for afternoons when you dont want a strong hit.'),
    ('volt-pearls-spearmint', 'dailypoucher@pouchbase.local', 4, 7, 6, 7, 'Pleasant enough but I wish it lasted longer. Mild strength option.'),

    -- Cuba Bubblegum
    ('cuba-bubblegum', 'flavorhunter@pouchbase.local', 7, 8, 7, 7, 'Legit bubblegum flavor. Nostalgic and fun. The strength is a surprise.'),
    ('cuba-bubblegum', 'nicnerd@pouchbase.local', 8, 7, 6, 7, 'Novelty flavor that actually works. Tastes like Hubba Bubba.'),

    -- Cuba Cola
    ('cuba-cola', 'nicnerd@pouchbase.local', 7, 7, 7, 7, 'Cola candy in pouch form. Fizzy sweet notes that are oddly addictive.'),
    ('cuba-cola', 'flavorhunter@pouchbase.local', 7, 8, 6, 7, 'More interesting than it has any right to be. The cola flavor is surprisingly accurate.'),

    -- Grant's Ice Cool
    ('grants-ice-cool', 'dailypoucher@pouchbase.local', 5, 7, 7, 7, 'Budget option that punches above its weight. Decent ice mint for the price.'),
    ('grants-ice-cool', 'tincanreview@pouchbase.local', 5, 7, 6, 7, 'Nothing fancy but good value. Does what it says on the tin.'),

    -- Grant's Wild Berry
    ('grants-wild-berry', 'flavorhunter@pouchbase.local', 4, 8, 6, 7, 'Sweet berry at a budget price. Solid if youre watching your wallet.'),
    ('grants-wild-berry', 'pouchwizard@pouchbase.local', 5, 7, 6, 7, 'Decent fruit flavor for the price point. Not amazing but absolutely fine.')
)
insert into reviews (product_id, user_id, burn_rating, flavor_rating, longevity_rating, overall_rating, review_text)
select p.id, u.id, sr.burn_rating, sr.flavor_rating, sr.longevity_rating, sr.overall_rating, sr.review_text
from seed_reviews sr
join products p on p.slug = sr.product_slug
join auth.users u on u.email = sr.reviewer_email
on conflict (product_id, user_id) do update
set
  burn_rating = excluded.burn_rating,
  flavor_rating = excluded.flavor_rating,
  longevity_rating = excluded.longevity_rating,
  overall_rating = excluded.overall_rating,
  review_text = excluded.review_text,
  created_at = now();
