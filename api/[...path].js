// api/[...path].js — Single catch-all router for all API endpoints
// Consolidates all handlers to stay within Vercel Hobby plan (12 function limit)

import loginHandler       from './_auth/login.js'
import registerHandler    from './_auth/register.js'
import meHandler          from './_auth/me.js'
import forgotPwHandler    from './_auth/forgot-password.js'

import feedHandler        from './_feed/index.js'
import postHandler        from './_feed/posts/[id].js'
import commentsHandler    from './_feed/posts/[id]/comments.js'
import likeHandler        from './_feed/posts/[id]/like.js'

import discoverHandler    from './_users/discover.js'
import profileHandler     from './_users/profile.js'
import userHandler        from './_users/[id].js'

import campHandler        from './_camp/index.js'
import campPeopleHandler  from './_camp/people.js'

import cdsHandler         from './_cds/index.js'

import conversationsHandler from './_chat/conversations/index.js'
import messagesHandler    from './_chat/messages/[id].js'

import communitiesHandler from './_communities/index.js'
import connectionsHandler from './_connections/index.js'
import eventsHandler      from './_events/index.js'

import jobsHandler        from './_jobs/index.js'
import jobHandler         from './_jobs/[id].js'

import marketplaceHandler from './_marketplace/index.js'
import listingHandler     from './_marketplace/listings/[id].js'
import vendorsHandler     from './_marketplace/vendors/index.js'

import notificationsHandler from './_notifications/index.js'
import ppaHandler         from './_ppa/index.js'
import skillsHandler      from './_skills/index.js'
import uploadHandler      from './_upload.js'

import adminUsersHandler  from './_admin/users/index.js'
import adminReportsHandler from './_admin/reports/index.js'

// Route table — order matters: specific routes before dynamic ones
const routes = [
  // Auth
  { pattern: /^\/auth\/login$/,           handler: loginHandler },
  { pattern: /^\/auth\/register$/,        handler: registerHandler },
  { pattern: /^\/auth\/me$/,              handler: meHandler },
  { pattern: /^\/auth\/forgot-password$/, handler: forgotPwHandler },

  // Feed — specific sub-routes first
  { pattern: /^\/feed\/posts\/([^/]+)\/like$/,     handler: likeHandler,     params: ['id'] },
  { pattern: /^\/feed\/posts\/([^/]+)\/comments$/, handler: commentsHandler, params: ['id'] },
  { pattern: /^\/feed\/posts\/([^/]+)$/,           handler: postHandler,     params: ['id'] },
  { pattern: /^\/feed$/,                           handler: feedHandler },

  // Users — specific before dynamic
  { pattern: /^\/users\/discover$/,  handler: discoverHandler },
  { pattern: /^\/users\/profile$/,   handler: profileHandler },
  { pattern: /^\/users\/([^/]+)$/,   handler: userHandler, params: ['id'] },

  // Camp
  { pattern: /^\/camp\/people$/, handler: campPeopleHandler },
  { pattern: /^\/camp$/,         handler: campHandler },

  // CDS
  { pattern: /^\/cds$/, handler: cdsHandler },

  // Chat
  { pattern: /^\/chat\/conversations$/,       handler: conversationsHandler },
  { pattern: /^\/chat\/messages\/([^/]+)$/,   handler: messagesHandler, params: ['id'] },

  // Communities
  { pattern: /^\/communities$/, handler: communitiesHandler },

  // Connections
  { pattern: /^\/connections$/, handler: connectionsHandler },

  // Events
  { pattern: /^\/events$/, handler: eventsHandler },

  // Jobs — specific before dynamic
  { pattern: /^\/jobs\/([^/]+)$/, handler: jobHandler, params: ['id'] },
  { pattern: /^\/jobs$/,          handler: jobsHandler },

  // Marketplace — specific before dynamic
  { pattern: /^\/marketplace\/listings\/([^/]+)$/, handler: listingHandler, params: ['id'] },
  { pattern: /^\/marketplace\/vendors$/,           handler: vendorsHandler },
  { pattern: /^\/marketplace$/,                    handler: marketplaceHandler },

  // Notifications
  { pattern: /^\/notifications$/, handler: notificationsHandler },

  // PPA
  { pattern: /^\/ppa$/, handler: ppaHandler },

  // Skills
  { pattern: /^\/skills$/, handler: skillsHandler },

  // Upload
  { pattern: /^\/upload$/, handler: uploadHandler },

  // Admin
  { pattern: /^\/admin\/users$/,   handler: adminUsersHandler },
  { pattern: /^\/admin\/reports$/, handler: adminReportsHandler },
]

export default async function handler(req, res) {
  // Build the path from the catch-all [...path] param
  const segments = req.query.path
  const path = '/' + (Array.isArray(segments) ? segments.join('/') : (segments || ''))

  // Match against route table
  for (const route of routes) {
    const match = path.match(route.pattern)
    if (match) {
      // Inject dynamic URL params into req.query so handlers can use req.query.id etc.
      if (route.params) {
        route.params.forEach((param, i) => {
          req.query[param] = decodeURIComponent(match[i + 1])
        })
      }
      return route.handler(req, res)
    }
  }

  return res.status(404).json({ error: 'API route not found', path })
}
