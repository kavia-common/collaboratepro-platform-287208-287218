'use strict';

const { gql } = require('graphql-tag');

module.exports = gql`
  scalar DateTime

  type Company {
    id: ID!
    name: String!
    domain: String
    plan: String
    createdAt: DateTime
    updatedAt: DateTime
  }

  type User {
    id: ID!
    email: String!
    name: String!
    roles: [String!]!
    companyId: ID!
    status: String!
    createdAt: DateTime
    updatedAt: DateTime
  }

  type Membership {
    id: ID!
    userId: ID!
    companyId: ID!
    roles: [String!]!
    createdAt: DateTime
    updatedAt: DateTime
  }

  type Project {
    id: ID!
    title: String!
    status: String!
    companyId: ID!
    createdBy: ID!
    description: String
    createdAt: DateTime
    updatedAt: DateTime
  }

  type Event {
    id: ID!
    projectId: ID!
    companyId: ID!
    title: String!
    startAt: DateTime!
    endAt: DateTime
    description: String
    createdBy: ID!
    createdAt: DateTime
    updatedAt: DateTime
  }

  type ChatThread {
    id: ID!
    projectId: ID!
    companyId: ID!
    title: String!
    createdBy: ID!
    archived: Boolean!
    createdAt: DateTime
    updatedAt: DateTime
  }

  type Message {
    id: ID!
    threadId: ID!
    companyId: ID!
    senderId: ID!
    content: String!
    createdAt: DateTime
    updatedAt: DateTime
  }

  type PageInfo {
    endCursor: String
    hasNextPage: Boolean!
  }

  type MessageConnection {
    edges: [MessageEdge!]!
    pageInfo: PageInfo!
  }

  type MessageEdge {
    node: Message!
    cursor: String!
  }

  type Query {
    me: User
    projects: [Project!]!
    project(id: ID!): Project
    events: [Event!]!
    event(id: ID!): Event
    chatThreads(projectId: ID!): [ChatThread!]!
    messages(threadId: ID!, first: Int = 20, after: String): MessageConnection!
  }

  type Mutation {
    createProject(title: String!, description: String): Project!
    updateProject(id: ID!, title: String, description: String, status: String): Project!
    archiveProject(id: ID!): Boolean!

    createEvent(projectId: ID!, title: String!, startAt: DateTime!, endAt: DateTime, description: String): Event!
    updateEvent(id: ID!, title: String, startAt: DateTime, endAt: DateTime, description: String): Event!

    createThread(projectId: ID!, title: String!): ChatThread!
    postMessage(threadId: ID!, content: String!): Message!
  }

  type Subscription {
    threadCreated(projectId: ID!): ChatThread!
    messageAdded(threadId: ID!): Message!
  }
`;
