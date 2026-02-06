# API Documentation

Base URL: `http://localhost:5000` (or your deployed URL)

## Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/register` | Register a new user | No |
| POST | `/login` | Login user | No |
| PUT | `/update` | Update user profile | Yes |

## Friends & Social (`/api/friends`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| GET | `/list` | Get list of friends | Yes |
| GET | `/requests` | Get pending friend requests | Yes |
| POST | `/request/:userId` | Send friend request | Yes |
| PUT | `/accept/:requestId` | Accept friend request | Yes |
| PUT | `/reject/:requestId` | Reject friend request | Yes |
| DELETE | `/remove/:friendId` | Unfriend a user | Yes |
| POST | `/block/:userId` | Block a user | Yes |

## Chat (`/api/chat`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| GET | `/:roomId` | Get chat history for a room | Yes |

## Players (`/api/player`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/link` | Link Riot Account | Yes |
| GET | `/stats` | Get current user's stats | Yes |
| GET | `/profile/:userId` | Get another user's profile | Yes |
| GET | `/search` | Search for players | Yes |

## Teams (`/api/teams`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| GET | `/` | Get all teams | No |
| POST | `/` | Create a new team | Yes |
| PUT | `/:id` | Update team | Yes |
| DELETE | `/:id` | Delete team | Yes |
| POST | `/:id/members` | Add member to team | Yes |
| DELETE | `/:id/members/:userId` | Remove member from team | Yes |

## Tournaments (`/api/tournaments`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| GET | `/` | Get all tournaments | No |
| GET | `/:id` | Get tournament details | No |
| POST | `/` | Create tournament | Yes |
| POST | `/:id/join` | Join a tournament | Yes |

## Payments (`/api/payments`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/create-payment-intent` | Initialize Stripe payment | Yes |

## Uploads (`/api/upload`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/` | Upload file (avatar/banner) | Yes |

## Admin (`/api/admin`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| GET | `/stats` | Get system statistics | Yes (Admin) |
| GET | `/users` | Get all users | Yes (Admin) |
| DELETE | `/users/:id` | Delete a user | Yes (Admin) |
| PUT | `/users/:id/role` | Update user role | Yes (Admin) |
| GET | `/tournaments` | Get all tournaments | Yes (Admin) |
| DELETE | `/tournaments/:id` | Delete tournament | Yes (Admin) |
