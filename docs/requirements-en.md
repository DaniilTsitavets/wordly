# Wordly. Business Requirements for the Word-Learning Functionality by Language Topics

**Document audience:** Product · Design · Development

---

## 1. Purpose of the Document

This document describes the business requirements for the functionality of learning foreign words through thematic levels. The product helps users systematically memorize words using mnemonics, various learning mechanics, spaced repetition, and gamification elements.

---

## 2. Domain

### 2.1 What the Product Does

**Wordly** is a web application for learning foreign words. The product is built around two methodologically grounded techniques for acquiring vocabulary:

1. **Mnemonics (audio and visual associations)** — accelerate the initial encoding of a word in memory through a vivid image linked to its sound.
2. **Spaced repetition** — bring a word back for review at moments calculated along the forgetting curve, so it does not "drop out" of memory.

Wordly systematizes and automates the application of these techniques: content is structured by topics and subtopics, each word passes through a sequence of learning mechanics of increasing difficulty (mnemonics → flashcards → matching → filling gaps → word builder), and after being learned it automatically enters the review queue with intervals of 1 / 3 / 7 / 14 / 21 / 30 days.

Key functional blocks:

- **Structured content** — the "Topic → Subtopic → Learning levels" hierarchy.
- **5 learning mechanics** of varying cognitive difficulty — from passive familiarization to active reproduction.
- **Mnemonics** — figurative associations as a tool for fast memorization.
- **Spaced repetition** with fixed intervals (1, 3, 7, 14, 21, 30 days), aligned with the forgetting curve.
- **Gamification** — gems (in-app currency), streak, daily goals, daily game; Tamagotchi (in the future) — to support regular practice.
- **Personal vocabulary** — a list of learned words with progress metadata.
- **Statistics and metrics** of progress (total words, streak, "remember" %, points).

### 2.2 What Problem It Solves

The key difficulty in learning a foreign language is the **forgetting curve (Ebbinghaus forgetting curve)**: without timely review, most new vocabulary leaves memory within the first day after encountering a word, and after a few days the user can reproduce almost nothing of what was learned. At the same time, the methodologically correct memorization techniques — mnemonics (accelerate encoding) and spaced repetition (counteract the forgetting curve) — are well known and proven effective, but they require systematic application that is hard to maintain on your own.

**Wordly solves this problem** by arranging both techniques into a single managed process:

1. **Mnemonics as the initial-acquaintance stage** — a word is memorized through a figurative association rather than rote learning, so it "sticks" in memory faster.
2. **Multi-stage learning mechanics** — a word is worked through from several angles (recognition → matching with translation → partial spelling → full spelling), which strengthens the connection and moves it into long-term memory.
3. **Scheduled spaced repetition** — the system itself brings a word back for review exactly when it is about to "drop out" of memory along the forgetting curve, and the user does not need to manually plan the review schedule.
4. **Gamification** — supports regular practice, without which neither mnemonics nor spaced repetition works.

---

## 3. Target Audience

### 3.1 Primary Audience

- **Students and pupils** learning foreign languages as part of a curriculum or to prepare for exams.
- **Self-learners aged 18–35** who learn a language for work, relocation, or travel from scratch.
- **Users who struggle with memorizing words** — those for whom traditional methods (e.g., word lists) do not work.

### 3.2 Secondary Audience

- People learning a second/third language.
- Language teachers looking for additional tools for their students.
- Users of language apps (e.g., Duolingo) dissatisfied with the effectiveness of memorizing vocabulary specifically.

### 3.3 User Needs

| Need | How the product addresses it |
| --- | --- |
| Memorize new words quickly and durably | Mnemonics + 5 mechanics from passive to active |
| Not forget what was learned over time | Spaced repetition (1/3/7/14/21/30 days) and the Recall section |
| Stay motivated for daily practice | Streak, gems, daily goals; Tamagotchi and daily game (in the future) |
| See one's own progress | Statistics (Stats), Vocabulary, learned-words counter |
| Try the product without registration | Guest mode: access to the first subtopic without an account |
| Learn at a comfortable pace | Personal daily goal in minutes, configurable in the profile |
| Pleasant visual experience | App color theme, selectable in the profile |

---

## 4. Glossary

| Term                         | Definition                                                                                                                                   |
|------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| **Topic**                    | A language topic that groups a set of subtopics (e.g., "Food", "Transport"). It is the root element for grouping words in the app structure. |
| **Subtopic**                 | A section within a topic containing a specific set of words. A subtopic includes learning levels.                                            |
| **Level**                    | One stage of going through a subtopic, implementing a single learning mechanic.                                                              |
| **Level 0**                  | A special level with mnemonics. Exists only if there are words with mnemonics.                                                               |
| **Mnemonics/Mnemo card**     | A figurative card with a visual and phonetic association that helps memorize a word.                                                         |
| **Flashcards**               | The "Flashcards" mechanic — initial memorization of a word through image and translation.                                                    |
| **Matching**                 | The "Matching" mechanic — reinforcing the "word — translation" correspondence.                                                               |
| **Filling Gaps**             | The "Filling Gaps" mechanic — reinforcing spelling by restoring missing letters.                                                             |
| **Word Builder**             | The "Word Builder" mechanic — practicing word spelling by assembling it from letters.                                                        |
| **Recall**                   | The active-recall mechanic — in the app the user performs the Word Builder mechanic.                                                         |
| **AI Chat**                  | A conversational AI trainer for practicing a subtopic's vocabulary in a live role-play dialogue in the target language.                      |
| **Spaced repetition**        | A system that returns words for review at fixed intervals: 1, 3, 7, 14, 21, and 30 days — for long-term memorization of a word.              |
| **Daily goal**               | A user's personal time-based norm (minutes) per day.                                                                                         |
| **Streak**                   | A series of consecutive days on which the user completed the daily goal.                                                                     |
| **Tamagotchi**               | A visual mascot character on the home screen reflecting the user's activity (in the future).                                                 |
| **Daily game**               | A daily mini-challenge. Requires separate elaboration.                                                                                       |
| **Gems**                     | In-app currency / points for completing levels and goals.                                                                                    |
| **Guest user**               | An unregistered user with limited access to content.                                                                                         |

---

## 5. Data Model (Business Level)

The key entities and their business meaning are described below. The technical implementation is out of scope.

| Entity | Business meaning |
| --- | --- |
| **users** | A registered user. Stores first name, last name, email, interface language, notification settings, daily goal in minutes, current streak, and gem count (in-app currency). |
| **topics** | A thematic course section (e.g., "Food", "Travel"). Groups subtopics into logical groups. |
| **subtopics** | A subtopic within a section. Contains a set of words to learn and defines the order of progression. Can disable individual learning mechanics. |
| **words** | A vocabulary unit: foreign word, transcription, translation, usage example with translation, image. Each word is linked to a subtopic. |
| **mnemonics** | A mnemonic for a word: image and association text for memorization. Not every word has a mnemonic. |
| **user_word_state** | The state of a specific word for a user: mastery status, date and interval of the next review (spaced repetition). |
| **user_subtopic_level_mechanic_progress** | The user's progress on mechanics within a subtopic: which exercise type was started or completed, and when the progression started and finished. |

---

## 6. App Screens

| # | Screen | Purpose |
| --- | --- | --- |
| 1 | Loading | Splash screen when the app opens |
| 2 | Home screen (authenticated user) | List of topics and subtopics available to progress through; streak; gems/points; daily-goal progress bar; timer; Tamagotchi and daily game (in the future) |
| 3 | Home screen (unauthenticated user) | List of topics and subtopics; the first topic's subtopics are available to progress through; daily game (in the future); app information |
| 4 | Login popup | Sign in to an account (email, password) |
| 5 | Registration popup | Create an account (first name, last name, email, password) |
| 6 | Daily goal | Set the daily norm on first launch |
| 7 | Subtopic screen | List of levels (0–4) showing their status |
| 8 | Mnemonics | Level 0 — mnemonic cards |
| 9 | Flashcards | Level 1 — the "Flashcards" learning mechanic |
| 10 | Matching | Level 2 — the "Matching" learning mechanic (matching with translation) |
| 11 | Filling Gaps | Level 3 — the "Filling Gaps" learning mechanic |
| 12 | Word Builder | Level 4 — the "Word Builder" learning mechanic |
| 13 | Recall screen | Review screen — words scheduled for review today |
| 14 | Recall cards | Word cards for review |
| 15 | Recall level | Section for reviewing a word |
| 16 | Vocabulary screen | The user's vocabulary — a list of learned words |
| 17 | Profile | View and edit user data |
| 18 | Statistics | Stats: total words, streak, points, daily-goal progress; "remember" percentage (in the future) |
| 19 | AI Chat | Conversational practice of a subtopic's vocabulary with the AI assistant |

---

## 7. User Scenarios

### 7.1 First App Launch

```
Open the app
  → Loading screen
  → "Start learning" button
  → Is the user registered?
        NO → Registration popup
               → Daily-goal selection screen (minutes per day)
               → Home screen
        YES → Login popup
               → Home screen
```

### 7.2 Navigating Topics and Subtopics

```
Home screen
  → A topic is displayed
  → List of subtopics available to progress through
  → List of all words in the topic
  → "Start learning" button
  → Subtopic screen (list of levels)
  → "Start" button
  → Level 0 (if there are mnemonics) or Level 1
```

### 7.3 Going Through a Subtopic (Main Flow)

```
Start learning a subtopic
  → Are there mnemonics?
        YES → Level 0 (mnemonics) → Level-complete screen
        NO  → Level 1
  → Level 1 → Level-complete popup → Subtopic screen
  → Level 2 → Level-complete popup → Subtopic screen
  → Level 3 → Level-complete popup → Subtopic screen
  → Level 4 → Subtopic-complete popup
  → Are all subtopics completed?
        NO → Move to the next subtopic
        YES → Move to the next topic
  → Are all topics completed?
        NO → Move to the next topic
        YES → Learning-complete screen
```

### 7.4 Reviewing Words

```
Home screen / Review screen
  → List of words whose interval is due today
  → "Recall" button
  → Mechanic — type the words from letters
  → The system records the result and schedules the next interval
  → Recall-complete popup
```

---

## 8. Learning Structure

### 8.1 Content Hierarchy

```
Topic
└── Subtopic
        ├── Level 0 — Mnemonics            [only if there are mnemonics]
        ├── Level 1 — Flashcards
        ├── Level 2 — Matching (with translation)
        ├── Level 3 — Filling Gaps
        └── Level 4 — Word Builder
```

### 8.2 Word List Before Start (**In the future:**)

- When opening a topic, the user can see all the words they will study.
- The list is shown before learning begins.
- The user will be able to mark familiar words and exclude them.

### 8.3 Word Progress Logic

- Level 0 words (with mnemonics) are practiced in levels 1–4 on equal footing with the rest.
- A mnemonic is not shown again in levels 1–4.

---

## 9. Level 0: Mnemonics

### 9.1 Appearance Condition

Level 0 is shown only if the subtopic has at least one word with a mnemonic.

### 9.2 Screen and Card Format

**Screen elements:** card, Previous / Complete buttons, progress bar.

**Front side:**

- Mnemo-image (visual association).
- The word being studied (in the foreign language).
- Transcription.
- Text starting with the phrase "Imagine..." — a figurative association story.
- Word pronunciation playback button (and/or autoplay).

**Back side:**

- Translation of the word into the user's native language (large).
- The word (small).
- Usage example in context.

### 9.3 Navigation

- Click on the card — flip.
- The user moves through cards forward and backward.
- The card list is not shown — only the current card.
- The level is complete when the user has viewed all cards at least once and pressed the "Complete" button.

### 9.4 Connection with Further Learning

All Level 0 words are automatically included in levels 1–4 of the same subtopic.

---

## 10. Learning Mechanics

### 10.1 Flashcards — Level 1

**Goal:** initial acquaintance with the word and its sound.

**Business logic:** passive familiarization with the word.

**Screen elements:** card, Next / Previous buttons, progress bar.

- Front: image, word, transcription, flip hint, Next button.
- Back: translation (large), word (small), example in context with translation, Next button.

**Behavior:**

- The card shows the foreign word + pronunciation.
- Click on the card — flip; the user sees the translation into their native language + a usage example.
- The user flips through all the subtopic's words forward/backward.
- There is no grading — all viewed words are recorded.
- The level is complete when the user has viewed all cards at least once and pressed the "Complete" button.

### 10.2 Matching — Level 2

**Goal:** reinforce the "word ↔ translation" pair.

**Business logic:** establishing the "word → translation" connection.

**Screen elements:**

- Two columns: foreign words and translations.
- Progress indicator, progress bar.

**Behavior:**

- A set of foreign words and translations is shown.
- The user selects a pair from the two columns.
- A correct pair turns green and is recorded.
- An incorrect pair turns red and can be retried.
- If there are incorrectly matched pairs, the user is not advanced until all pairs are matched correctly.
- The level is complete when all pairs are matched correctly.

### 10.3 Filling Gaps — Level 3

**Goal:** reinforce spelling by restoring missing letters.

**Business logic:** active reproduction of the correct spelling of a word from memory.

**Screen elements:**

- A word with missing letters.
- A hint (the ability to listen to the audio pronunciation).
- Input field.
- Reset / Check Answer buttons.
- Progress bar.

**Behavior:**

- The user enters the missing letters.
- Correct → green, move to the next word.
- Wrong → red, retry.

### 10.4 Word Builder — Level 4

**Goal:** reinforce spelling.

**Business logic:** reinforcing word spelling — the most difficult stage.

**Screen elements:**

- Hint: translation and/or image (image preferred).
- Word pronunciation playback button (TTS).
- Answer field.
- Set of letters.
- Reset / Check Answer buttons.
- Progress bar.

**Behavior:**

- Pressing letters forms the word in the answer field.
- Clicking "Check answer" — verification.
- Correct → green, move to the next word.
- Wrong → red + "Try again", retry.

### 10.5 Recall

**MVP:** the Word Builder mechanic.

**General logic:**

- After a subtopic is completed, words enter the review queue with intervals (see the table).
- Every day the system forms a list of words whose interval is due — viewable in the Recall section (pinned in the header — the "Brain" icon).
- "Recall" button.
- **MVP — the Word Builder mechanic:**
  - The translation is shown.
  - The user assembles the foreign word from the offered letters + clicks the "Check answer" button.
  - On an error — show "Try again" and prompt to enter the word again.

**In the future:**

- The system measures the time taken on each word.
- The input time is recorded.
- The best time result (personal record) is saved.
- % of words recalled at each interval. Shown in the profile's Stats section.
- Context mode: a sentence with a gap is shown in the foreign language and the word in the source language — the user types the full translation of the word into the foreign language.

**Intervals:**

| Step | Interval |
| --- | --- |
| 1 | +1 day |
| 2 | +3 days |
| 3 | +7 days |
| 4 | +14 days |
| 5 | +21 days |
| 6 | +30 days |

**Goal:** active reproduction of the word without hints.

### 10.6 Audio Pronunciation

- Pronunciation playback is available in all learning mechanics except Matching: Level 0 (mnemonics), Flashcards (Level 1), Filling Gaps (Level 3), Word Builder (Level 4), and Recall.
- Pronunciation is played via TTS.
- The playback button is a mandatory element of these mechanics.

---

## 11. Daily Goals System

### 11.1 Goal Types

| Type | Parameter | Example |
| --- | --- | --- |
| Time-based | Minutes per day | "Study 10 minutes a day" |

### 11.2 Setting and Changing

- Set on first launch (onboarding screen).
- Changed in the profile settings and takes effect immediately.

### 11.3 Tracking

- The system keeps a daily progress counter for the goal in the profile / statistics.
- The counter resets every day by the user's local time.
- On reaching the goal: notification + bonus gems.

---

## 12. Gamification

### 12.1 Gems

| Action | Reward |
| --- | --- |
| Completing a level | Base gems (+5) |
| Completing a topic | Bonus gems (+15) |
| Completing the daily goal | Bonus gems (+10) |
| Completing a recall session | Bonus gems: all words correct (+10), some errors (+5) |
| **In the future:** For a long Streak | Bonus gems |

- On the level-complete and topic-complete screens, the number of earned gems is shown with a "Collect" button.
- The total balance is visible in the profile and in the app header.

### 12.2 Tamagotchi

**In the future:**

A visual character on the home screen that reacts to the user's activity.

- The character is "happy" / active while the user meets their daily goals.
- When days are skipped, the character reacts visually (hungry, sad, etc.).

### 12.3 Daily Game

**In the future:**

- A daily mini-challenge on the home screen.
- Available only to registered users.
- Completing it grants gems / points.

---

## 13. User Vocabulary

### 13.1 Vocabulary Contents

The vocabulary contains all words the user has started learning (passed Level 1).

### 13.2 Display

Each word in the vocabulary contains:

- Foreign word, translation.
- Next review in … days.

### 13.3 Word Counter
**In the future:**

- The number of learned words — a key progress metric.
- Shown in Stats and in Vocabulary.

---

## 14. Profile and Statistics

### 14.1 Profile

**View:** avatar, first name, last name, email, password, color theme, and a switch to edit mode.

**Edit:**

- First name, last name, email, password.
- App color theme.
- "Save changes" button.

### 14.2 Statistics (Stats)

| Metric                                   | Description |
|------------------------------------------| --- |
| **Gems**                                 | Accumulated points. Shown in the profile statistics and the home-screen header. |
| **Streak** (in the future)               | The current series of active days. Shown in the profile statistics and the home-screen header. The update and reset logic (broken when the daily goal is not met within a day) — (in the future). |
| **Total learned words** (in the future)  | The total number of words in the vocabulary. Shown in the profile statistics and the vocabulary. |
| **Daily goal** (in the future)           | Completion progress is shown in the profile statistics progress bar. |
| **"Remember" percentage** (in the future) | % of words recalled at each review interval. |

---

## 15. AI Chat (AI Assistant)

### 15.1 Purpose

A conversational AI trainer for practicing learned vocabulary in a live dialogue in the target language. The AI assistant does not explain grammar and does not act like a "classroom" — it places the user in a realistic role-play situation around the subtopic and creates natural reasons to use the target words.

### 15.2 Access and Context

- The session is tied to a specific subtopic: the target word list is the words of that subtopic.
- Access — only for authenticated users.

### 15.3 Opening Phase

- The assistant invents a unique, real scenario that naturally fits the subtopic (e.g., "Food" → a farmers' market; "Kitchen" → a cooking masterclass).
- It takes on the role of a character in this scenario and invites the user to join the conversation.
- It does not introduce itself as an AI or a trainer.
- The opening message is no more than 3–4 sentences.

### 15.4 Conversation Rules

- Each assistant reply is 2–4 sentences long.
- The dialogue language is the target language only. If the user writes in their native language or unreadably, the assistant stays in role and asks them to repeat in the target language.
- The assistant internally tracks which of the target words the user has used in a natural context, but does not report this during the dialogue.
- It nudges toward the target words situationally (through questions and descriptions), without explicit demands.
- Corrective feedback is implicit only (implicit recast): the correct form is woven into the assistant's reply, without phrasing like "the right way is" / "you should say". Spelling mistakes are quietly remembered and end up in the final summary.
- Off-topic requests (programming, politics, general knowledge) are declined in role, without breaking the scenario.
- On a hint request — one hint in role (through a description or question), but without translating the target word.

### 15.5 Session End and Summary

- The user ends the session with keywords: "stop", "finish", "done", "end", "quit", "конец", "стоп", "хватит", and close synonyms.
- The assistant exits the role and opens the summary with the fixed phrase "Great practice! Here's how your session went".

---

## 16. Guest User Scenario

### 16.1 Available Content

The guest user has access to all subtopics of the first topic.

### 16.2 Guest Flow

```
Open the app
  → The user is not registered
  → Available: the first topic's subtopics
  → Content completed
  → Registration popup
        → Value explanation: all topics, progress, reviews, vocabulary
  → Registration → Full access
```

### 16.3 Guest Progress

- Guest-session progress is not saved after the app is closed.

**In the future:**

- Migration of guest-session progress to the account after registration.

---

## 17. Product Metrics

| Metric | Description | Data source |
| --- | --- | --- |
| **DAU / MAU** | User activity | `users` (`last_active_date`) |
| **Retention (D1/D7/D30)** | User return | `users` (`created_at`, `last_active_date`) |
| **Level completion rate** | Share of completed levels out of started ones | `user_subtopic_level_mechanic_progress` (`started_at`, `completed_at`, `status`) |
| **Daily goal completion rate** | % of days with the daily goal met | `users` (`daily_goal_awarded_date`, `daily_goal_min`) |
| **Streak (avg / max)** | Average and maximum series of days | `users` (`streak`) |
| **Recall time** | Average word-input time in recall | (in the future) — requires a `recall_time` field in `user_word_state` |
| **Recall personal record** | Best recall speed result | (in the future) — requires a `personal_record` field in `user_word_state` |
| **Recall success rate** | % of correct answers in recall | `user_word_state` (`session_correct`) |
| **Repetition recall rate** | "Remember" % at each interval (1/3/7/14/21/30 days) | `user_word_state` (`recall_interval`, `session_correct`) |
| **Words per session** | Average number of new words per session | `user_word_state` (`session_date`) |
| **Guest → Reg conversion** | Conversion of unregistered users into accounts | `users` (`is_guest`, `created_at`) |
| **Error rate by word** | Words that users most often get wrong | (in the future) — requires error logging |

---

## 18. Out of Scope

| Feature                     | Note |
|-----------------------------| --- |
| Adaptive word list          | Excluding familiar words before start (in the future) |
| "Daily game"                | Requires a separate BRD |
| Detailed Tamagotchi mechanic | Requires a separate design document |
| Social features             | Leaderboards, comparison with friends |
| Difficulty adaptation       | Automatic difficulty change based on errors |