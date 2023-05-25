import BudgetForm from "expensasaures/components/forms/BudgetForm";
import Layout from "expensasaures/components/layout/Layout";

const create = () => {
  return (
    <Layout>
      <div className="mx-auto max-w-[1200px] mt-10">
        <h1 className="text-center mb-10">Create Budget</h1>
        <BudgetForm />
      </div>
    </Layout>
  );
};

export default create;
