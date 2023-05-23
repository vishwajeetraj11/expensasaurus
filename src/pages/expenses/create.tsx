import ExpenseForm from "expensasaures/components/forms/ExpenseForm";
import Layout from "expensasaures/components/layout/Layout";
import React from "react";

const create = () => {
  return (
    <Layout>
      <div className="mx-auto max-w-[800px] mt-10">
        <p>Add Expense</p>
        <ExpenseForm />
      </div>
    </Layout>
  );
};

export default create;
