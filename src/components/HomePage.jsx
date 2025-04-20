import { Link } from 'react-router-dom';

const HomePage = () => {
    return(
        <>
    <div className = "min-h-screen min-w-screen inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)]">
    <div className="flex justify-center items-center h-screen bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)]">
      <div className="bg-slate-800 p-8 rounded-lg shadow-lg space-y-4 w-80 border-black">
        <h2 className="text-2xl font-semibold text-center text-white">Select Login Type</h2>
        <div className="flex flex-col space-y-4">
          <Link to="/user">
            <button className="w-full text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 shadow-lg shadow-cyan-500/50 dark:shadow-lg dark:shadow-cyan-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
              Login as User
            </button>
          </Link>
          <Link to="/agent">
            <button className="w-full text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 shadow-lg shadow-teal-500/50 dark:shadow-lg dark:shadow-teal-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
              Login as Agent
            </button>
          </Link>
        </div>
      </div>
    </div>
    </div>
        </>
    )
}

export default HomePage;