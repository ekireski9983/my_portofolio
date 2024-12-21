export default function Dashboard() {
  return (
    <>
    <div className="flex mt-16">
              <div className="md:w-3/4 px-4 ">
                  <div className="rounded-xl">
                      <h2 className="text-left text-5xl w-full font-extrabold">Hello</h2>
                      <h3 className="text-left text-2xl w-full font-bold">I Am <span class="text-blue-600">Rezky jayadi saputra</span></h3>
                      <p className="w-1/2">Saya seorang mahasiswa aktif Politeknik LP3I Jakarta Semester 5</p>
                    <div className="w-full py-2">
                          <button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                              <label>Contact</label>
                          </button>
                      </div>
                  </div>
              </div>
              <div className="md:w-1/3">
              <img class="" src="/image/IMG_20230725_085929.jpg"></img>
              </div>
          </div>
    </>

  );
}
