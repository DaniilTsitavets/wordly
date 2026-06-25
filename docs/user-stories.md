# Wordly. Functional requirements (User Stories)

**Document audience:** Product · Design · Development

This document contains the functional requirements for Wordly in User Story format, prioritized with the **MoSCoW** method:

- **Must Have** — critical for the MVP; the product is not released without it.
- **Should Have** — important, but does not block the MVP. Delivered in the first iteration or right after release.
- **Could Have** — desirable, adds value. Delivered if resources allow.
- **Won't Have (this time)** — out of scope for the current release.

Each story references sections of [`requirements-en.md`](./requirements-en.md) as the source of truth for behavior.

---

## Must Have

### Authentication and account

#### US-001: User registration

**As** a new user
**I want** to register in the system with email and password
**So that** I can save my learning progress and get access to all app features

##### Acceptance criteria

- [ ] Registration popup with fields: first name, last name, email, password
- [ ] Email validation (format)
- [ ] Password validation (at least 8 characters)
- [ ] Registering an existing email again — a clear error
- [ ] After successful registration the user sees the daily goal selection screen

#### US-002: User authentication

**As** a registered user
**I want** to sign in to my account with email and password
**So that** I can continue learning from where I left off

##### Acceptance criteria

- [ ] Sign-in popup with email and password fields
- [ ] On a wrong pair — a clear error without revealing what exactly is wrong
- [ ] After sign-in the authenticated user's home screen opens
- [ ] The session persists across app restarts

#### US-003: Guest sign-in

**As** an unauthenticated user
**I want** to try the app without registering
**So that** I can evaluate the product before creating an account

##### Acceptance criteria

- [ ] The unauthenticated user's home screen is available immediately on open
- [ ] A guest user can access the subtopics of the first topic
- [ ] After completing the available content, a registration popup is shown explaining the value (all topics, progress, recalls, vocabulary)
- [ ] Guest session progress is not saved after the app is closed

#### US-004: Sign out

**As** an authenticated user
**I want** to sign out of my account
**So that** another person cannot access my progress on a shared device

##### Acceptance criteria

- [ ] There is a sign-out button in the profile
- [ ] After sign-out the auth token becomes invalid
- [ ] The user returns to the unauthenticated home screen

#### US-005: View and edit profile

**As** an authenticated user
**I want** to view and edit my data
**So that** I can keep my account information up to date

##### Acceptance criteria

- [ ] View: avatar, first name, last name, email, password (hidden), color theme
- [ ] Edit: first name, last name, email, password, color theme
- [ ] The "Save changes" button applies edits immediately

See [`requirements-en.md` §14.1](./requirements-en.md#141-profile).

---

### Content and navigation

#### US-006: Browse the list of topics and subtopics

**As** a user
**I want** to see the list of available topics and subtopics
**So that** I can choose what to study

##### Acceptance criteria

- [ ] The home screen shows the list of topics with their subtopics
- [ ] Each subtopic's status is visible (available, in progress, completed)
- [ ] Subtopics available for study are visibly different from locked ones

#### US-007: View all words of a topic before starting

**As** a user
**I want** to see the list of all words of a topic before starting to learn
**So that** I understand in advance what I will need to learn

##### Acceptance criteria

- [ ] The word list is shown when the topic is opened
- [ ] For each word the foreign word and its translation are visible
- [ ] The list is available before pressing "Start learning"

#### US-008: View subtopic levels

**As** a user who has started a subtopic
**I want** to see the list of its levels with their statuses
**So that** I understand what I have already completed and what is left

##### Acceptance criteria

- [ ] The subtopic screen shows levels 0–4
- [ ] Each level's status is visible: locked, available, completed
- [ ] Level 0 is present only if the subtopic has words with mnemonics

See [`requirements-en.md` §8.1](./requirements-en.md#81-content-hierarchy).

---

### Learning mechanics

#### US-009: Learning mnemonics (Level 0)

**As** a user starting a new subtopic
**I want** to look through mnemonic cards with sound associations
**So that** I memorize words faster through an imagery technique

##### Acceptance criteria

- [ ] The card contains a mnemonic image, the word being learned, transcription, association text ("Imagine...")
- [ ] Back side: translation (large), word (small), usage example
- [ ] Forward/back navigation between cards
- [ ] The level is completed after viewing all cards and pressing "Finish"
- [ ] All Level 0 words are automatically included in levels 1–4

See [`requirements-en.md` §9](./requirements-en.md#9-level-0-mnemonics).

#### US-010: Completing Flashcards (Level 1)

**As** a user
**I want** to go through flashcards for a first acquaintance with the words
**So that** I memorize how a word looks, sounds, and translates

##### Acceptance criteria

- [ ] Card front: image, word, transcription, flip hint
- [ ] Card back: translation (large), word (small), example in context with translation
- [ ] Clicking the card flips it
- [ ] Forward/back navigation between cards
- [ ] The level is completed after viewing all cards and pressing "Finish"

See [`requirements-en.md` §10.1](./requirements-en.md#101-flashcards--level-1).

#### US-011: Completing Matching (Level 2)

**As** a user
**I want** to match foreign words with their translations
**So that** I reinforce the "word ↔ translation" connection

##### Acceptance criteria

- [ ] The screen shows two columns: foreign words and translations
- [ ] A correct pair — green, locked in
- [ ] An incorrect pair — red, can be retried
- [ ] The user is not advanced until all pairs are matched correctly
- [ ] The level is completed when all pairs are matched correctly

See [`requirements-en.md` §10.2](./requirements-en.md#102-matching--level-2).

#### US-012: Completing Filling Gaps (Level 3)

**As** a user
**I want** to restore the missing letters in a word
**So that** I actively recall the correct spelling of the word

##### Acceptance criteria

- [ ] Screen: word with missing letters, hint, input field, Reset / Check Answer buttons, progress bar
- [ ] Correct → green, move to the next word
- [ ] Wrong → red, retry the attempt
- [ ] The level is completed after correctly entering all words

See [`requirements-en.md` §10.3](./requirements-en.md#103-filling-gaps--level-3).

#### US-013: Completing Word Builder (Level 4)

**As** a user
**I want** to assemble a word from the offered letters
**So that** I finally reinforce the spelling of the word

##### Acceptance criteria

- [ ] Screen: hint (translation and/or image), answer field, set of letters, Reset / Check Answer buttons, progress bar
- [ ] Pressing letters forms the word in the answer field
- [ ] Clicking "Check answer" verifies the answer
- [ ] Correct → green, move to the next word
- [ ] Wrong → red + "Try again", retry the attempt
- [ ] The level is completed after correctly entering all words

See [`requirements-en.md` §10.4](./requirements-en.md#104-word-builder--level-4).

---

### Recall (Spaced Repetition)

#### US-014: View words due for recall today

**As** a user
**I want** to see the list of words whose recall interval is due today
**So that** I don't miss the daily review and don't forget what I learned

##### Acceptance criteria

- [ ] The Recall section is pinned in the header (the "Brain" icon)
- [ ] Opening the section, the user sees the list of words with a due interval
- [ ] If there are no words — a corresponding state is shown

#### US-015: Completing a recall session

**As** a user
**I want** to review words via Word Builder
**So that** I actively recall learned words and extend their life in memory

##### Acceptance criteria

- [ ] For each word the translation is shown, the user assembles the foreign word from letters
- [ ] On a mistake — "Try again" and a retry
- [ ] The system records the result of each word
- [ ] The next interval is scheduled in steps: 1 → 3 → 7 → 14 → 21 → 30 days
- [ ] On a fully correct session — +10 gems; if there are mistakes — +5 gems
- [ ] On completion a Recall-finished popup is shown

See [`requirements-en.md` §10.5](./requirements-en.md#105-recall).

---

### Daily goal and gamification

#### US-016: Setting the daily goal during onboarding

**As** a new user
**I want** to set a personal daily target on first launch
**So that** I learn at a pace that is comfortable for me

##### Acceptance criteria

- [ ] The goal selection screen appears right after registration
- [ ] The goal is set in minutes per day
- [ ] After saving, the user lands on the home screen

See [`requirements-en.md` §11](./requirements-en.md#11-daily-goals-system).

#### US-017: Changing the daily goal in the profile

**As** a user
**I want** to change the daily goal in the profile settings
**So that** I can adjust the pace to my changed rhythm of life

##### Acceptance criteria

- [ ] The "Daily goal" field is available in profile editing
- [ ] After saving, the changes take effect immediately

#### US-018: Earning gems for completing a level

**As** a user who has completed a level
**I want** to receive base gems
**So that** I see progress and keep motivation

##### Acceptance criteria

- [ ] On level completion +5 gems are awarded
- [ ] The level-finished screen shows the number of earned gems
- [ ] The "Collect" button confirms the award
- [ ] The total gems count updates in the header and in the profile

#### US-019: Earning gems for completing a topic

**As** a user who has completed all subtopics of a topic
**I want** to receive bonus gems
**So that** I feel the achievement of a major milestone

##### Acceptance criteria

- [ ] On completing the last subtopic of a topic +15 gems are awarded
- [ ] The bonus is awarded exactly once per topic

#### US-020: Earning gems for reaching the daily goal

**As** a user who has reached the daily goal
**I want** to receive bonus gems
**So that** daily activity is rewarded

##### Acceptance criteria

- [ ] On reaching the daily goal +10 gems are awarded
- [ ] The bonus is awarded exactly once per day (by the user's local time)
- [ ] The user sees a notification about reaching the goal

#### US-021: Earning gems for a recall session

**As** a user who has completed a recall session
**I want** to receive gems for the quality of the review
**So that** regular reviews are rewarded more

##### Acceptance criteria

- [ ] All words correct → +10 gems
- [ ] There are mistakes → +5 gems
- [ ] The bonus is visible on the recall-finished screen

See [`requirements-en.md` §12.1](./requirements-en.md#121-gems).

---

### Vocabulary and statistics

#### US-022: View learned words in the vocabulary

**As** a user
**I want** to see the list of learned words and information about them
**So that** I can see my progress and review what I've covered if needed

##### Acceptance criteria

- [ ] The vocabulary shows all words that have passed Level 1
- [ ] For each word the foreign word, translation, and next recall date are visible

See [`requirements-en.md` §13](./requirements-en.md#13-user-vocabulary).

#### US-023: View profile statistics

**As** a user
**I want** to see my statistics
**So that** I can assess my own progress

##### Acceptance criteria

- [ ] Visible: Gems, Streak, Total learned words, daily goal progress
- [ ] Gems and Streak are additionally shown in the header
- [ ] The word counter is synchronized between Stats and Vocabulary

See [`requirements-en.md` §14.2](./requirements-en.md#142-statistics-stats).

---

## Should Have

#### US-024: Sign in with Google OAuth

**As** a user
**I want** to sign in to the app via a Google account
**So that** I don't have to enter a separate password and can start using it faster

##### Acceptance criteria

- [ ] The sign-in/registration popup has a "Sign in with Google" button
- [ ] After successful Google authentication an account is created or found by `oauth_provider` + `oauth_id`
- [ ] If a regular account exists for this email — it is linked to the OAuth identifier
- [ ] A valid JWT is returned, the user lands on the home screen

#### US-025: Conversational practice with the AI assistant

**As** a user who has completed a subtopic
**I want** to practice the learned words in a live role-play dialogue
**So that** I move them from passive knowledge to active use

##### Acceptance criteria

- [ ] The session is tied to a subtopic — the target word list is taken from it
- [ ] The assistant opens the session with a realistic scenario based on the subtopic (e.g., "Food" → a farmers' market)
- [ ] The assistant stays in role and does not introduce itself as an AI
- [ ] The length of each reply is 2–4 sentences
- [ ] Corrective feedback is implicit only (implicit recast)
- [ ] Off-topic requests are declined in role
- [ ] On prompt injection / attempts to "lift restrictions" the assistant stays in role

#### US-026: Ending the AI session and getting a summary

**As** a user
**I want** to end the AI session by a keyword and get a summary
**So that** I understand which words I reinforced and which need review

##### Acceptance criteria

- [ ] The session ends on words like "stop", "finish", "конец", "хватит"
- [ ] The assistant exits the role and opens the summary with "Great practice! Here's how your session went 👇"
- [ ] The summary contains blocks: ✅ Words you used, 🔤 Spelling to check, 📝 Words to revisit, 🌟 Overall

See [`requirements-en.md` §15](./requirements-en.md#15-ai-chat-ai-assistant).

---

## Could Have (in the future)

#### US-027: Audio pronunciation of words

**As** a user
**I want** to hear a native pronunciation of a word
**So that** I memorize how a word sounds, not just how it's spelled

##### Acceptance criteria

- [ ] A playback button is present in all mechanics except Matching
- [ ] A native-speaker pronunciation or quality TTS is played
- [ ] Autoplay is supported on Level 0

#### US-028: Streak update and reset

**As** a user who studies regularly
**I want** the streak to increase for reaching the daily goal and reset on a miss
**So that** I feel the weight of daily activity

##### Acceptance criteria

- [ ] When the daily goal is reached, the streak increases by 1
- [ ] If the daily goal is not reached within a day — the streak resets to 0
- [ ] The current streak is visible in the header and in the profile statistics

#### US-029: Extended word card in the vocabulary

**As** a user
**I want** to see in the vocabulary the date a word was learned, the recall count, and a usage example
**So that** I can better track the history of working with each word

##### Acceptance criteria

- [ ] For each word in the vocabulary the following are visible: usage example, date learned, number of Recall reviews

#### US-030: Viewing the "remembered" percentage in statistics

**As** a user
**I want** to see what percentage of words I successfully recall at each review interval
**So that** I understand the effectiveness of my learning

##### Acceptance criteria

- [ ] Stats shows the % of recalled words per interval (1/3/7/14/21/30 days)
- [ ] The metric updates upon completion of recall sessions

#### US-031: Tamagotchi on the home screen

**As** a user
**I want** to see a mascot character reacting to my activity
**So that** I have an emotional anchor that supports motivation

##### Acceptance criteria

- [ ] The character is shown on the home screen
- [ ] The character's state changes depending on daily goal completion
- [ ] On missed days the character looks "sad" / "hungry"

#### US-032: Game of the day

**As** an authenticated user
**I want** to complete a daily mini-challenge
**So that** I diversify the routine and earn extra gems

##### Acceptance criteria

- [ ] The game of the day is available only to authenticated users
- [ ] Available once per day
- [ ] Completion awards gems / points

#### US-033: Recall time metrics

**As** a user
**I want** to see my average recall time and personal best
**So that** I can compete with myself and feel progress in speed

##### Acceptance criteria

- [ ] The system records the completion time of each word in recall
- [ ] The average time and personal best are visible in Stats
- [ ] The record updates only on improvement

#### US-034: Contextual Recall mode

**As** a user
**I want** an alternative review mode — a sentence with a gap into which I type the full translation
**So that** I train not only spelling but also understanding in context

##### Acceptance criteria

- [ ] An alternative mode is available in Recall
- [ ] A context sentence with a gap is shown in the foreign language
- [ ] The user types the full translation of the word

#### US-035: Migrating guest progress to an account

**As** a guest user who decided to register
**I want** to keep the guest session progress in the new account
**So that** I don't have to start learning over

##### Acceptance criteria

- [ ] On registration after a guest session, progress for words and subtopics is migrated to the account
- [ ] The progress is not duplicated and not lost on failures

See [`requirements-en.md` §16](./requirements-en.md#16-guest-user-scenario).

---

## Won't Have (this time)

#### US-036: Adaptive word list (excluding familiar words)

**As** a user
**I want** to mark familiar words before starting and exclude them from learning
**So that** I don't waste time on what I already know

##### Acceptance criteria

- [ ] In the word list before starting, familiar words can be marked
- [ ] Marked words are not included in the learning levels
- [ ] The decision can be changed later

#### US-037: Social features

**As** a user
**I want** to compare my progress with friends and see leaderboards
**So that** I have an additional social incentive

##### Acceptance criteria

- [ ] A friends' activity feed
- [ ] Leaderboards by gems / streak
- [ ] Ability to add friends

#### US-038: Difficulty adaptation

**As** a user
**I want** the app to adjust the difficulty to my mistakes by itself
**So that** I'm not bored on the easy stuff and don't get stuck on the hard stuff

##### Acceptance criteria

- [ ] The algorithm analyzes the frequency and type of mistakes
- [ ] The difficulty of selected words / intervals adapts
- [ ] The behavior is transparent to the user

See [`requirements-en.md` §18](./requirements-en.md#18-out-of-scope).
