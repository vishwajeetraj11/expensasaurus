import IncomeForm from "expensasaures/components/forms/IncomeForm"
import Layout from "expensasaures/components/layout/Layout"

const edit = () => {
    return (
        <Layout>
            <div className="mx-auto max-w-[800px] mt-10">
                <p>Edit Income</p>
                <IncomeForm />
            </div>
        </Layout>
    )
}

export default edit