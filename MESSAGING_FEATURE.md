# Système de Messagerie - EMsee

## Vue d'ensemble

Système de messagerie privée en temps réel permettant aux étudiants et professeurs de communiquer directement sur la plateforme EMsee.

## Fonctionnalités

### ✅ Conversations privées
- Création automatique de conversations entre deux utilisateurs
- Liste des conversations triée par date de mise à jour
- Compteur de messages non lus par conversation
- Indicateur de dernier message

### ✅ Chat en temps réel
- Envoi et réception de messages instantanés via Socket.IO
- Indicateur de saisie en cours (typing indicator)
- Messages affichés avec horodatage relatif
- Scroll automatique vers les nouveaux messages
- Design responsive avec bulles de messages

### ✅ Recherche d'utilisateurs
- Modal de recherche pour trouver des utilisateurs
- Résultats en temps réel
- Affichage du profil (avatar, nom, bio)
- Création de conversation au clic

### ✅ Internationalisation
- Support complet en/fr/es
- Horodatages localisés avec date-fns

## Structure Backend

### Modèles Prisma

**Conversation**
```prisma
model Conversation {
  id           Int
  createdAt    DateTime
  updatedAt    DateTime
  participants ConversationParticipant[]
  messages     Message[]
}
```

**ConversationParticipant**
```prisma
model ConversationParticipant {
  id             Int
  conversationId Int
  userId         Int
  joinedAt       DateTime
  lastReadAt     DateTime?  // Pour tracking des messages non lus
}
```

**Message**
```prisma
model Message {
  id             Int
  conversationId Int
  senderId       Int
  content        String
  read           Boolean
  createdAt      DateTime
}
```

### API Endpoints

**GET /api/messages/conversations**
- Récupère toutes les conversations de l'utilisateur
- Pagination: `?page=1&limit=20`
- Retourne: conversations avec dernier message et compteur non lus

**POST /api/messages/conversations**
- Crée ou récupère une conversation avec un utilisateur
- Body: `{ recipientId: number }`
- Retourne: conversation avec participants

**GET /api/messages/conversations/:id**
- Récupère les détails d'une conversation
- Vérifie que l'utilisateur est participant

**GET /api/messages/conversations/:id/messages**
- Récupère les messages d'une conversation
- Pagination: `?page=1&limit=50`
- Messages triés du plus ancien au plus récent

**POST /api/messages/conversations/:id/messages**
- Envoie un message dans une conversation
- Body: `{ content: string }`
- Émet événement Socket.IO aux autres participants

**PATCH /api/messages/conversations/:id/read**
- Marque une conversation comme lue
- Met à jour `lastReadAt` du participant

### Services

**MessageService** (`backend/src/services/message.service.js`)
- `getOrCreateConversation(userId1, userId2)` - Trouve ou crée conversation
- `getUserConversations(userId, page, limit)` - Liste avec compteurs non lus
- `getConversationMessages(conversationId, userId, page, limit)` - Messages paginés
- `sendMessage(conversationId, senderId, content)` - Envoie et met à jour conversation
- `markConversationAsRead(conversationId, userId)` - Marque comme lu

### Socket.IO Events

**Côté serveur:**
- `joinConversation` - Utilisateur rejoint une room de conversation
- `leaveConversation` - Utilisateur quitte une room
- `typing` - Utilisateur tape un message
- `newMessage` - Émis vers `user_${userId}` pour notifier nouveau message

**Côté client:**
- Écoute `newMessage` pour mettre à jour en temps réel
- Écoute `userTyping` pour afficher indicateur de saisie
- Émet `typing` lors de la saisie

## Structure Frontend

### Composants

**Messages** (`frontend/src/pages/Messages.jsx`)
- Page principale avec layout à deux colonnes
- Sidebar: liste des conversations
- Content: fenêtre de chat ou état vide

**ConversationList** (`frontend/src/components/ConversationList.jsx`)
- Liste scrollable des conversations
- Badge de messages non lus
- Sélection de conversation active
- Avatar et aperçu du dernier message

**ChatWindow** (`frontend/src/components/ChatWindow.jsx`)
- En-tête avec infos de l'autre utilisateur
- Zone de messages scrollable
- Indicateur de saisie en cours
- Textarea avec bouton d'envoi
- Gestion Enter pour envoyer

**NewConversationModal** (`frontend/src/components/NewConversationModal.jsx`)
- Modal de recherche d'utilisateurs
- Résultats en temps réel
- Création de conversation au clic

### Hooks personnalisés

**useConversations** (`frontend/src/hooks/useMessages.js`)
- Récupère la liste des conversations
- Écoute les nouveaux messages via Socket.IO
- Met à jour l'ordre et les compteurs non lus
- `refetch()` pour recharger manuellement

**useConversationMessages** (`frontend/src/hooks/useMessages.js`)
- Récupère les messages d'une conversation
- Gère l'envoi de messages
- Rejoint/quitte la room Socket.IO automatiquement
- Scroll automatique vers le bas
- Marque comme lu automatiquement
- Gère l'indicateur de saisie

### Services

**MessageService** (`frontend/src/services/message.service.js`)
```javascript
export const getConversations = (page, limit)
export const createConversation = (recipientId)
export const getConversation = (conversationId)
export const getMessages = (conversationId, page, limit)
export const sendMessage = (conversationId, content)
export const markAsRead = (conversationId)
```

## Installation & Configuration

### 1. Migration de la base de données

```bash
cd backend
npm run db:migrate  # Crée les tables conversations, messages, etc.
```

### 2. Démarrer le backend

```bash
cd backend
npm run dev  # Port 5000 avec Socket.IO
```

### 3. Démarrer le frontend

```bash
cd frontend
npm run dev  # Port 5173
```

### 4. Variables d'environnement

Backend `.env`:
```ini
DATABASE_URL="mysql://user:pass@localhost:3306/projetjs_db"
JWT_SECRET=your_secret
PORT=5000
```

Frontend `.env`:
```ini
VITE_API_URL=http://localhost:5000/api
```

## Utilisation

### Créer une conversation

1. Aller sur la page Messages
2. Cliquer sur "Nouvelle conversation"
3. Rechercher un utilisateur par nom/username
4. Cliquer sur l'utilisateur pour créer la conversation

### Envoyer un message

1. Sélectionner une conversation dans la liste
2. Taper le message dans le champ de texte
3. Appuyer sur Enter ou cliquer sur le bouton d'envoi
4. Le message apparaît instantanément pour les deux utilisateurs

### Marquer comme lu

- Les messages sont automatiquement marqués comme lus quand on ouvre une conversation
- Le compteur de non lus se met à jour en temps réel

## Améliorations futures possibles

- [ ] Pièces jointes (images, fichiers)
- [ ] Messages vocaux
- [ ] Réactions aux messages (emoji)
- [ ] Suppression de messages
- [ ] Édition de messages
- [ ] Conversations de groupe
- [ ] Appels vidéo/audio
- [ ] Notifications push
- [ ] Messages épinglés
- [ ] Recherche dans les messages

## Tests

```bash
cd backend
npm test  # Lance les tests Jest
```

Créer tests pour:
- Création de conversations
- Envoi de messages
- Pagination
- Vérification des permissions (participants uniquement)
- Compteurs non lus

## Sécurité

- ✅ Authentification JWT requise pour tous les endpoints
- ✅ Vérification que l'utilisateur est participant avant accès
- ✅ Validation Zod sur tous les inputs
- ✅ Socket.IO avec authentification via token
- ✅ Sanitization du contenu (à améliorer avec DOMPurify si HTML)

## Performance

- ✅ Pagination des conversations (20 par page)
- ✅ Pagination des messages (50 par page)
- ✅ Index sur conversationId et senderId
- ✅ Eager loading avec Prisma includes
- ⚠️ Considérer caching Redis pour conversations actives (à implémenter)

## Troubleshooting

**Socket.IO ne se connecte pas:**
- Vérifier que le token JWT est valide
- Vérifier l'URL du backend dans `SocketContext.jsx`
- Vérifier les CORS dans `socketService.js`

**Messages non reçus en temps réel:**
- Vérifier que les deux utilisateurs sont connectés
- Vérifier les logs du serveur Socket.IO
- Vérifier que `joinConversation` est émis

**Erreur de migration:**
- Vérifier DATABASE_URL dans .env
- Supprimer le dossier migrations et refaire `npx prisma migrate dev`

## Documentation API

Documentation Swagger disponible à: `http://localhost:5000/api-docs`

Tag: **Messages** - Tous les endpoints de messagerie
