import { configureStore } from '@reduxjs/toolkit'
import authReducer    from './slices/authSlice'
import examReducer    from './slices/examSlice'
import questionReducer from './slices/questionSlice'
import attemptReducer from './slices/attemptSlice' // Phase 5
import resultReducer  from './slices/resultSlice'
import adminReducer   from './slices/adminSlice'   // Phase 3: admin stats + students

// store.js — the single Redux store for the entire frontend app.
// configureStore() combines all our slice reducers into one root reducer.
// Redux DevTools browser extension works automatically with this setup.
const store = configureStore({
  reducer: {
    auth:      authReducer,      // login, register, current user
    exams:     examReducer,      // exam list, selected exam (admin + student)
    questions: questionReducer,  // MCQ question CRUD (admin)
    attempt:   attemptReducer,   // active exam session — timer, answers (Phase 5)
    results:   resultReducer,    // student's own results
    admin:     adminReducer,     // dashboard stats, student roster, exam results
  },
})

export default store
