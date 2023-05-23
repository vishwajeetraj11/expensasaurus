import IncomeForm from "expensasaures/components/forms/IncomeForm";
import Layout from "expensasaures/components/layout/Layout";

const create = () => {
  return (
    <Layout>
      <div className="mx-auto max-w-[800px] mt-10">
        <p>Add Income</p>
        <IncomeForm />
      </div>
    </Layout>
  );
};

export default create;
