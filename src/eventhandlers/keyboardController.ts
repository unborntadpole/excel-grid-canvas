
export interface KeyboardHandler {
    hitTest(e:KeyboardEvent): void;
    keyDown(): void;
    keyUp(): void;
}
