import ExpenseForm from "expensasaures/components/forms/ExpenseForm";
import Layout from "expensasaures/components/layout/Layout";

const create = () => {
  return (
    <Layout>

      <div className="mx-auto px-4 gap-10 max-w-[1200px] mt-10 w-full flex flex-1 h-full">
        <div className="w-[50%]">
          <h1 className="text-center mb-10">Add Expense</h1>
          <ExpenseForm />
        </div>
        <div className="h-auto w-full lg:rounded-bl-[120px] xl:rounded-bl-[200px] rounded-md flex items-center justify-center flex-1"
          style={{ backgroundImage: `url(/img/create_expense.png)` }}
        >
        </div>
      </div>
    </Layout>
  );
};

export default create;
