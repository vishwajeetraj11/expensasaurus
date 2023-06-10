import { Title } from "@tremor/react";
import ExpenseForm from "expensasaures/components/forms/ExpenseForm";
import Layout from "expensasaures/components/layout/Layout";

const create = () => {
  return (
    <Layout>

      <div className="mx-auto px-4 gap-10 max-w-[1200px] mt-10 w-full flex flex-1 h-full">
        <div className="w-full lg:w-[50%]">
          <Title className="text-center mb-10">Add Expense</Title>
          <ExpenseForm />
        </div>
        <div className="lg:w-[50%] hidden md:block h-auto lg:rounded-bl-[120px] xl:rounded-bl-[200px]"
          style={{ backgroundImage: `url(/img/create_expense.png)` }}
        >
        </div>
      </div>
    </Layout>
  );
};

export default create;
