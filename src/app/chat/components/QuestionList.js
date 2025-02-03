import React from "react";
import QuestionItem from "./QuestionItem";

export default function QuestionList({ questions, onDeleteQuestion, role, onMarkAnswered }) {
  return (
    <ul>
      {questions.map((question) => (
        <QuestionItem
          key={question.id}
          question={question}
          onDeleteQuestion={onDeleteQuestion}
          role={role}
          onMarkAnswered={onMarkAnswered} // ここで渡す
        />
      ))}
    </ul>
  );
}
