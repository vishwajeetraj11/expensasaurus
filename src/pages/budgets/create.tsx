import BudgetForm from "expensasaures/components/forms/BudgetForm";
import Layout from "expensasaures/components/layout/Layout";

const create = () => {
  return (
    <Layout>
      <div className="mx-auto max-w-[1200px] mt-10 w-full flex flex-1 h-full">
        <div className="w-[50%]">
          <h1 className="text-center mb-10">Create Budget</h1>
          <BudgetForm />
        </div>
        <div className="bg-blue-500 h-auto w-full flex items-center justify-center flex-1">
          {/* <Exp /> */}
        </div>
      </div>
    </Layout>
  );
};

export default create;
