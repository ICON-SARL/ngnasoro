
# Fix PIN Input - Stale Closure Bug

## Probleme

Le `handleSetupPin` utilise `useCallback` avec `formData.pin` en dependance. Quand le 4eme chiffre est saisi :

1. `onChange` appelle `setFormData(prev => ({...prev, pin: value}))` -- mise a jour asynchrone
2. 300ms plus tard, `handleSetupPin()` s'execute
3. Mais `handleSetupPin` a capture l'ancien `formData.pin` (3 chiffres) via sa closure
4. `formData.pin.length !== 4` est donc VRAI, ce qui affiche l'erreur "Le PIN doit contenir 4 chiffres"

Le meme probleme affecte `handleVerifyPin` et `handleConfirmPin`.

## Solution

Passer la valeur du PIN directement en parametre aux handlers au lieu de lire `formData.pin` depuis la closure.

### Fichier : `src/components/auth/UnifiedModernAuthUI.tsx`

**1. Modifier les 3 handlers pour accepter un parametre optionnel :**

```typescript
// handleSetupPin : accepter pinValue en parametre
const handleSetupPin = useCallback(async (pinValue?: string) => {
  const pin = pinValue ?? formData.pin;
  if (pin.length !== 4) { setPinError('Le PIN doit contenir 4 chiffres'); return; }
  setStep('confirm_pin');
  setPinError('');
}, [formData.pin]);

// handleVerifyPin : accepter pinValue en parametre
const handleVerifyPin = useCallback(async (pinValue?: string) => {
  const pin = pinValue ?? formData.pin;
  if (pin.length !== 4) { setPinError('Veuillez entrer 4 chiffres'); return; }
  // ... reste du code utilise `pin` au lieu de `formData.pin`
}, [formData.pin, getFullPhoneNumber, navigate, toast]);

// handleConfirmPin : accepter pinValue en parametre
const handleConfirmPin = useCallback(async (pinValue?: string) => {
  const confirmPin = pinValue ?? formData.confirmPin;
  if (confirmPin !== formData.pin) { ... }
  // ... reste du code
}, [formData.pin, formData.confirmPin, ...]);
```

**2. Modifier les 3 onChange pour passer la valeur directement :**

```typescript
// step === 'pin'
onChange={(value) => {
  setFormData(prev => ({ ...prev, pin: value }));
  setPinError('');
  if (value.length === 4) {
    setTimeout(() => handleVerifyPin(value), 300);  // passe value
  }
}}

// step === 'setup_pin'
onChange={(value) => {
  setFormData(prev => ({ ...prev, pin: value }));
  setPinError('');
  if (value.length === 4) {
    setTimeout(() => handleSetupPin(value), 300);  // passe value
  }
}}

// step === 'confirm_pin'
onChange={(value) => {
  setFormData(prev => ({ ...prev, confirmPin: value }));
  setPinError('');
  if (value.length === 4) {
    setTimeout(() => handleConfirmPin(value), 300);  // passe value
  }
}}
```

**3. Mettre a jour handleVerifyPin pour utiliser le parametre `pin` dans l'appel edge function** (au lieu de `formData.pin`).

**4. Mettre a jour handleConfirmPin pour utiliser le parametre `confirmPin` dans l'appel signup** (au lieu de `formData.confirmPin`).

## Fichier modifie

| Fichier | Changement |
|---------|-----------|
| `src/components/auth/UnifiedModernAuthUI.tsx` | Passage de la valeur PIN en parametre direct aux handlers pour eviter le stale closure |

## Resultat attendu

Les 4 chiffres sont bien transmis aux handlers, le PIN est valide, et l'etape suivante (confirmation ou connexion) s'enchaine correctement.
