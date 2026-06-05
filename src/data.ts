import { StudentExpense, StudentBudget, SavingsGoal } from "./types";

export const INITIAL_BUDGET: StudentBudget = {
  Food: 300,
  Textbooks: 150,
  Rent: 750,
  Transit: 60,
  Social: 125,
  Other: 50
};

export const INITIAL_EXPENSES: StudentExpense[] = [
  {
    id: "e1",
    title: "Organic Chemistry Textbook (Used Rent)",
    amount: 68.50,
    category: "Textbooks",
    date: "2026-06-01",
    notes: "Rented from campus bookstore, saved $110 over new price!"
  },
  {
    id: "e2",
    title: "Weekly Dorm Food Groceries",
    amount: 54.20,
    category: "Food",
    date: "2026-06-02",
    notes: "Mainly instant oatmeal, campus discount brand products, and eggs."
  },
  {
    id: "e3",
    title: "Weekend Pizza & Soda with Dorm Floor",
    amount: 18.00,
    category: "Social",
    date: "2026-06-03",
    notes: "Divided the cost across 4 roommates."
  },
  {
    id: "e4",
    title: "Student Monthly Train Transit Token",
    amount: 45.00,
    category: "Transit",
    date: "2026-05-28",
    notes: "Concession fare applied automatically via university student ID registrar."
  },
  {
    id: "e5",
    title: "Emergency Lab Safety Eyewear",
    amount: 12.00,
    category: "Other",
    date: "2026-06-04",
    notes: "Required for bio session lab class."
  },
  {
    id: "e6",
    title: "Campus Diner Lunch Special",
    amount: 11.25,
    category: "Food",
    date: "2026-06-04",
    notes: "Good local deal on a healthy wrap."
  }
];

export const INITIAL_GOALS: SavingsGoal[] = [
  {
    id: "g1",
    title: "Next Semester Textbooks Pot",
    targetAmount: 300,
    savedAmount: 180,
    targetDate: "2026-08-30",
    notes: "Aiming to buy fully used or shared from seniors."
  },
  {
    id: "g2",
    title: "Student Exchange Trip Fund",
    targetAmount: 1500,
    savedAmount: 650,
    targetDate: "2026-12-15",
    notes: "Need extra cushion for flight and overseas student dorm meals."
  }
];

export const EDUCATIONAL_STUDENT_TIPS = [
  {
    id: "tip1",
    metric: "Food",
    title: "Try Student 'Meal Prep' Sundays",
    text: "Cooking big batches of curry, rice, and roasted veggies on Sunday costs less than $3 per meal, compared to $12+ at campus cafes."
  },
  {
    id: "tip2",
    metric: "Textbooks",
    title: "Utilize Library Reserves & PDF Shares",
    text: "Most professors put 1-2 copies of required course readings on 'course reserve' in the library for free 2-hour checkouts. Always scan pages!"
  },
  {
    id: "tip3",
    metric: "Social",
    title: "Host Casual Dorm Board Game Nights",
    text: "Skip expensive clubs and bars with cover charges. Popcorn, sodas, and multiplayer board games cost practically zero and yield better long-term bonds."
  },
  {
    id: "tip4",
    metric: "Transit",
    title: "Register for Campus Bike share",
    text: "Many campuses have free or $10/year bike rental programs. Good cardiovascular exercise and cuts absolute transit expenses to zero."
  },
];
