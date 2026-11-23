# MrSheyhaki multiplayer server

Realtime backend for multiplayer games on mrsheyhaki.ir.

## Phase 4 (current)

- Supabase access-token authentication on every socket
- Create / join rooms (6-character codes)
- Host role, ready/not-ready, leave, disconnect marking
- **Snakes & Ladders** and **Family Words** game engines (Family Words: host picks 60/90/120 s, players match each picture with the right family word)
- **A or An Swipe** game engine
  - Host starts the match
  - Same word sent to all players
  - Players answer `a` or `an`
  - Points for correct + fast bonus
  - Auto-advance when everyone answered or time runs out
  - Final ranking

## Local setup

```bash
cd multiplayer-server
cp .env.example .env   # or copy
```

Edit `.env` and set the same Supabase URL + anon key used by the website.

```bash
npm install
npm start
```

Open http://localhost:3001/health — should show `"phase": 4`.

## Test with two accounts

1. Log in on https://mrsheyhaki.ir  
2. Open `test-client.html`  
3. Paste `access_token` from Local Storage  
4. Connect → Create room → copy code  
5. Second browser/account: Connect → Join → Toggle ready (both)  
6. Host clicks **Start A or An**  
7. Both players see the word and choose **a** / **an**

## Socket events (Phase 4)

| Client → server | Server → client |
|-----------------|-----------------|
| `room:create` | `room:update` |
| `room:join` `{ code }` | `room:error` |
| `room:leave` | `server:hello` |
| `room:setReady` `{ ready }` | `game:question` |
| `game:start` | `game:answerResult` |
| `game:answer` `{ answer: "a"\|"an" }` | `game:scoreboard` |
| `game:backToLobby` | `game:end` |
| `fw:settings` `{ timeLimit }` | `fw:question` |
| `fw:start` | `fw:result` |
| `fw:answer` | `fw:scoreboard` |
|  | `fw:end` |
| `client:ping` | `server:pong` |

Connect with:

```js
io(SERVER_URL, { auth: { token: accessToken } })
```
