# Использование иконок из кастомного шрифта

1. В проекте уже подключены стили в `src/main.tsx`:
   - `@/styles/icomoon.css`
   - `@/styles/icomoon.glyphs.css`
2. Используй компонент `IconFont`:

```tsx
import { IconFont } from '@/components/atoms/IconFont'

<IconFont name="diamond" size={24} />
<IconFont name="diamond-white" size={48} decorative />
```

## Параметры `IconFont`

- `name` — имя иконки из списка ниже
- `size` — число (px) или строка (например, `"1.5rem"`)
- `color` — цвет глифа
- `ariaLabel` — подпись для доступности
- `decorative` — `true`, если иконка декоративная

## Список имён иконок

- `diamond`
- `diamond-white`
- `fire`
- `book-colored`
- `planet`
- `increase`
- `trophey`
- `lighting2`
- `star`
- `brain`
- `sparkle`
- `player-colored`
- `heart`
- `lock3`
- `arrow-right`
- `eye`
- `cross2`
- `clock`
- `calendar`
- `lock2`
- `attention`
- `tick3`
- `joystick`
- `info`
- `google`
- `github`
- `stars`
- `timer`
- `lightning`
- `dumbbell`
- `coffe`
- `next`
- `play`
- `image`
- `filled-tick`
- `puzzle`
- `lock`
- `hierarchy`
- `reload`
- `user`
- `progress`
- `settings`
- `exit`
- `arrow-back2`
- `arrow-back`
- `player`
- `cross`
- `tick2`
- `book`
- `tick1`
- `edit`
- `target`
![alt text](frontend\public\iconsmap1.png)
![alt text](frontend\public\iconsmap2.png)