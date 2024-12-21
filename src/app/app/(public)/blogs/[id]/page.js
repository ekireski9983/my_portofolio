"use client";
import { useState, useEffect, useRef } from "react";
import Card from "../../../../components/card";
import { useParams } from "next/navigation";
import { Editor } from "@tinymce/tinymce-react";
import ConfigDialog from "../../../../components/ConfirmDialog";

export default function Blogsbyid() {
    const editorRef = useRef(null);
    const [modal, setModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");
    const params = useParams();
    const [data, setData] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [datakomen, setDataKomen] = useState({
        nama: "",
        email: "",
        komentar: "",
        blogId: params.id,
    });
    const [isLoadingKomentar, setLoadingKomentar] = useState(false);
    const [dataKomentar, setDataKomentar] = useState([]);
    const [reply, setReply] = useState({}); // Menyimpan balasan untuk komentar tertentu

    const clearData = () => {
        setDataKomen({
            nama: "",
            email: "",
            komentar: "",
            blogId: params.id,
        });
    };

    const inputHandler = (e) => {
        setDataKomen({ ...datakomen, [e.target.name]: e.target.value });
    };

    const onFetchBlogs = async () => {
        try {
            setLoading(true);
            let res = await fetch(`/api/blogs/${params.id}`);
            
            let data = await res.json();
            setData(data.data);
            setLoading(false);
        } catch (err) {
            console.log("err", err);
            setData(null);
            setLoading(false);
        }
    };

    const onFetchKomentar = async () => {
        try {
            setLoadingKomentar(true);
            let res = await fetch(`/api/komentar/${params.id}`);
            let data = await res.json();
            setDataKomentar(data.data);
            setLoadingKomentar(false);
        } catch (err) {
            console.log("err", err);
            setDataKomentar([]);
            setLoadingKomentar(false);
        }
    };

    const onCancel = () => {
        setModal(false);
        setModalTitle("");
        setModalMessage("");
        clearData();
    };

    async function onSubmitData() {
        try {
            // if (editorRef.current) {
                const body = datakomen;
                // body.komentar = editorRef.current.getContent();

                let res = await fetch("/api/komentar", {
                    method: "POST",
                    body: JSON.stringify(body),
                });

                let resData = await res.json();
                if (!resData.data) {
                    throw Error(resData.message);
                }
                setModal(true);
                setModalTitle("Info");
                setModalMessage(resData.message);
                onFetchKomentar();
            // }
        } catch (err) {
            console.error("ERR", err.message);
            setModal(true);
            setModalTitle("Err");
            setModalMessage(err.message);
        }
    }

    async function onSubmitReply(parentId) {
        try {
            const komentar = reply[parentId]; // Ambil nilai reply
            if (!komentar || komentar.trim() === "") {
                throw new Error("Reply cannot be empty"); // Validasi sebelum kirim
            }
    
            let res = await fetch("/api/reply-komentar", {
                method: "POST",
                body: JSON.stringify({
                    parentId,
                    komentar,
                    blogId: params.id, // Kirim blogId sebagai tambahan
                }),
            });
    
            let resData = await res.json();
            if (!resData.success) {
                throw new Error(resData.message); // Tangani error dari backend
            }
    
            setModal(true);
            setModalTitle("Info");
            setModalMessage(resData.message);
            setReply((prev) => ({ ...prev, [parentId]: "" })); // Reset input balasan
            onFetchKomentar(); // Refresh komentar
        } catch (err) {
            console.error("ERR", err.message);
            setModal(true);
            setModalTitle("Err");
            setModalMessage(err.message);
        }
    }
       

    useEffect(() => {
        onFetchBlogs();
        onFetchKomentar();
    }, []);

    if (isLoading) return <>Loading...</>;

    return (
        <>
            <div className="margin-0 mx-auto w-2/3">
                <h2 className="text-center text-[32px] font-bold w-full">{data.title}</h2>
                <div className="mb-40 mt-10" dangerouslySetInnerHTML={{ __html: data.content }} />
            </div>

            <Card title="Tuliskan komentar">
                <div className="w-full my-5">
                    <label>Nama</label>
                    <input
                        name="nama"
                        value={datakomen.nama}
                        onChange={inputHandler}
                        type="text"
                        className="w-full border my-input-text"
                    />
                </div>
                <div className="w-full my-2">
                    <label>Email</label>
                    <input
                        name="email"
                        value={datakomen.email}
                        onChange={inputHandler}
                        className="w-full border my-input-text"
                    />
                </div>
                <div className="w-full my-2">
                    <label>Komentar</label>
                       <textarea
                  name="komentar"
                  className="border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 w-full"
                  value={data.komentar}
                  onChange={inputHandler}
                  placeholder="Enter blog content"
                />
                    {/* <Editor
                        id="komentar"
                        apiKey="9cwimxs87anry0u2avnf1wswmlg849552261vhxbl2qb8qkw"
                        onInit={(_evt, editor) => (editorRef.current = editor)}
                        initialValue={datakomen.komentar}
                        init={{
                            height: 500,
                            menubar: false,
                            plugins: [
                                "advlist",
                                "autolink",
                                "lists",
                                "link",
                                "image",
                                "charmap",
                                "preview",
                                "anchor",
                                "searchreplace",
                                "visualblocks",
                                "code",
                                "fullscreen",
                                "insertdatetime",
                                "media",
                                "table",
                                "code",
                                "help",
                                "wordcount",
                            ],
                            toolbar:
                                "undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help",
                            content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                        }}
                    /> */}
                </div>
                <button className="btn-primary" onClick={onSubmitData}>
                    <span className="relative text-sm font-semibold text-white">Kirim</span>
                </button>
            </Card>

            {dataKomentar.map((komen, idx) => (
    <Card className="mt-5" key={idx} title={komen.nama}>
        <div dangerouslySetInnerHTML={{ __html: komen.komentar }} />
        <div className="mt-3">
        <textarea
                className="w-full border my-input-text"
                placeholder="Balas komentar ini..."
                value={reply[komen.id] || ""}
                onChange={(e) =>
                    setReply((prev) => ({ ...prev, [komen.id]: e.target.value }))
                }
            />
                     <button
                className="btn-primary mt-2"
                onClick={() => onSubmitReply(komen.id)} // Pastikan komen.id diteruskan
            >
                <span className="relative text-sm font-semibold text-white">Kirim balasan</span>
            </button>
        </div>
    </Card>
))}

            <ConfigDialog
                onOkOny={() => onCancel()}
                showDialog={modal}
                title={modalTitle}
                message={modalMessage}
                onCancel={() => onCancel()}
                onOk={() => onCancel()}
                isOkOnly={true}
            />
        </>
    );
}
