# Especificación: Snake Clásico

## 1. Objetivo y Alcance
**Objetivo**: Aplicación web del juego Snake clásico donde los usuarios controlan una serpiente para comer comida y crecer, evitando chocar con los bordes o consigo misma.

**Dentro de alcance**:
- Juego principal con mecánicas clásicas de Snake
- Sistema de puntuación
- Controles de teclado
- Pantalla de inicio y game over
- Responsive design básico

**Fuera de alcance**:
- Sistema de usuarios o autenticación
- Tabla de líderes global
- Múltiples niveles o dificultades
- Personalización de apariencia

## 2. Épicas

### EP1: Juego Principal
- Movimiento automático de la serpiente
- Control de dirección con teclado
- Generación aleatoria de comida
- Detección de colisiones (bordes/cuerpo)
- Crecimiento de la serpiente al comer

### EP2: Sistema de Puntuación
- Incremento de puntaje al comer
- Registro de puntaje máximo (local)
- Visualización de puntaje en tiempo real

### EP3: Gestión de Estados
- Pantalla de inicio con instrucciones
- Pantalla de juego principal
- Pantalla de game over con puntuación

## 3. Modelo de Datos
```typescript
// Estado del juego (frontend)
type GameState = {
  snake: Array<{ x: number; y: number }>;
  food: { x: number; y: number };
  direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  score: number;
  highScore: number;
  gameOver: boolean;
};
```

## 4. Rutas/Páginas
- `app/page.tsx`: Pantalla principal (inicio/juego/game over)

## 5. Endpoints API
*No aplica*: La app es 100% cliente-side sin necesidad de backend

## 6. Criterios de Aceptación

### EP1: Juego Principal
- [CA1] La serpiente se mueve automáticamente cada 200ms
- [CA2] Las teclas de flecha cambian dirección (no se puede invertir)
- [CA3] Nueva comida aparece en posición aleatoria al ser consumida
- [CA4] La serpiente crece al comer
- [CA5] Colisión con bordes/cuerpo termina el juego

### EP2: Sistema de Puntuación
- [CA6] Puntaje aumenta +10 por comida
- [CA7] HighScore persiste en localStorage
- [CA8] Se muestra puntaje actual y máximo

### EP3: Gestión de Estados
- [CA9] Pantalla inicial muestra instrucciones
- [CA10] Game over muestra puntuación final
- [CA11] Botón "Jugar" inicia nueva partida

## 7. Flujos de Usuario

### Jugador:
1. Abre la app (página principal)
2. Ve instrucciones y presiona "Jugar"
3. Controla serpiente con flechas para comer comida
4. Ve aumentar puntuación en tiempo real
5. Al chocar, ve pantalla de game over con puntuación
6. Puede reiniciar desde pantalla de game over