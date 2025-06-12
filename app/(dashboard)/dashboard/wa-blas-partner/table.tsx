"use client";

import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";
import { Table, InputNumber, Modal } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import useAxiosAuth from "@/hooks/axios/use-axios-auth";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import { formatRupiah } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Table Mitra",
  description: "Halaman Tabel Mitra WA Blast",
};

interface ApiFleetResponse {
  id: number;
  fleet_name: string;
  driver: {
    id: number;
    name: string;
  };
}

interface MitraData {
  key: string;
  driver_id: number;
  nama: string;
  fleet: string;
  saldo: number;
  biayaSewa: number;
}

export default function TablePage() {
  const axiosAuth = useAxiosAuth();
  const [data, setData] = useState<MitraData[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const handleInputChange = (key: string, field: keyof MitraData, value: number | null) => {
    setData(prev =>
      prev.map(item =>
        item.key === key ? { ...item, [field]: value ?? 0 } : item
      )
    );
  };

  const fetchDetail = async () => {
    try {
      const res = await axiosAuth.get<ApiFleetResponse[]>("/wa-blas/fleets");
      const fetchedData: MitraData[] = res.data.map((item) => ({
        key: item.id.toString(),
        driver_id: item.driver?.id ?? 0,
        nama: item.driver?.name || "-",
        fleet: item.fleet_name || "-",
        saldo: 0,
        biayaSewa: 0,
      }));

      setData(fetchedData);
    } catch (error) {
      console.error("Gagal mengambil data mitra:", error);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, []);

  const columns: ColumnsType<MitraData> = [
    {
      title: "Nama",
      dataIndex: "nama",
      key: "nama",
      fixed: "left",
    },
    {
      title: "Fleets",
      dataIndex: "fleet",
      key: "fleet",
    },
    {
      title: "Saldo",
      dataIndex: "saldo",
      key: "saldo",
      width: 160,
      render: (_value, record) => (
        <InputNumber
          style={{ width: "140px" }}
          value={record.saldo}
          min={0}
          formatter={value => formatRupiah(value as number)}
          parser={value => Number((value ?? "").replace(/[^\d]/g, ""))}
          onChange={value => handleInputChange(record.key, "saldo", value)}
        />
      ),
    },
    {
      title: "Biaya Sewa",
      dataIndex: "biayaSewa",
      key: "biayaSewa",
      width: 160,
      render: (_value, record) => (
        <InputNumber
          style={{ width: "140px" }}
          value={record.biayaSewa}
          min={0}
          formatter={value => formatRupiah(value as number)}
          parser={value => Number((value ?? "").replace(/[^\d]/g, ""))}
          onChange={value => handleInputChange(record.key, "biayaSewa", value)}
        />
      ),
    },
    {
      title: "Kekurangan Pembayaran",
      key: "kekuranganPembayaran",
      render: (_, record) => {
        const diff = record.biayaSewa - record.saldo;
        return diff > 0 ? (
          <span className="text-red-500">{formatRupiah(diff)}</span>
        ) : (
          "0"
        );
      },
    },
    {
      title: "Kelebihan Pembayaran",
      key: "kelebihanPembayaran",
      render: (_, record) => {
        const diff = record.saldo - record.biayaSewa;
        return diff > 0 ? (
          <span className="text-green-500">{formatRupiah(diff)}</span>
        ) : (
          "0"
        );
      },
    },
  ];

  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoadingSubmit(true);

      const filteredData = data.filter(item => item.saldo > 0 || item.biayaSewa > 0);

      if (filteredData.length === 0) {
        Swal.fire("Gagal", "Data Belum Ditambahkan", "error");
        return;
      }

      const payload = filteredData.map(item => {
        const jumlahKekurangan = item.biayaSewa - item.saldo;
        const jumlahKelebihan = item.saldo - item.biayaSewa;

        return {
          driver_id: item.driver_id,
          saldo: formatRupiah(item.saldo) ?? "0",
          biaya_sewa: formatRupiah(item.biayaSewa) ?? "0",
          jumlah_kekurangan: jumlahKekurangan > 0 ? formatRupiah(jumlahKekurangan) : "0",
          jumlah_kelebihan: jumlahKelebihan > 0 ? formatRupiah(jumlahKelebihan) : "0",
        };
      });

      const response = await axiosAuth.post("/wa-blas/send-wa-driver", payload);
      console.log("Response:", response.data);

      const { total_request, total_sent, total_failed, failed_details } = response.data;

      setModalVisible(false);

      let failedMessage = '';
      if (total_failed > 0) {
        failedMessage = `<br/><b>Detail Gagal:</b><ul style="text-align: left;">`;
        failed_details.forEach((fail: any) => {
          failedMessage += `<li>• ${fail.name} (${fail.phone}): ${fail.reason}</li>`;
        });
        failedMessage += `</ul>`;
      }

      Swal.fire({
        icon: total_failed === 0 ? "success" : "warning",
        title: "Hasil Pengiriman WhatsApp",
        html: `
          <b>Total Data:</b> ${total_request}<br/>
          <b>Berhasil Dikirim:</b> ${total_sent}<br/>
          <b>Gagal Dikirim:</b> ${total_failed}
          ${failedMessage}
        `,
      }).then(() => {
        const resetData = data.map(item => ({
          ...item,
          saldo: 0,
          biayaSewa: 0,
          jumlah_kekurangan: "-",
          jumlah_kelebihan: "-"
        }));
        setData(resetData);
      });

    } catch (error) {
      console.error("Gagal mengirim data:", error);
      Swal.fire("Error", "Terjadi kesalahan saat mengirim data.", "error");
    } finally {
      setLoadingSubmit(false);
    }
  };


  return (
    <div>
      <div className="flex items-center justify-between mt-8 mb-2">
        {/* <Heading title="Pastikan Nomor Whatsapp Valid" /> */}
        <p className="text-[20px] font-semibold text-red-500">Harap Pastikan Nomor Whatsapp Valid & Aktif</p>
        <Button onClick={() => setModalVisible(true)}>
          Kirim Data Blast
        </Button>
      </div>
      <Separator />
      <div className="overflow-auto bg-white p-4 rounded shadow">
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          scroll={{ y: 400 }}
        />
      </div>

      {/* Modal Dialog */}
      <Modal
        title="Konfirmasi Data"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Table
          columns={columns}
          dataSource={data.filter(item => item.saldo > 0 || item.biayaSewa > 0)} 
          pagination={false}
          scroll={{ y: 300 }}
          size="small"
          rowKey="key"
        />
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loadingSubmit}
            style={{
              padding: '10px 20px',
              backgroundColor: loadingSubmit ? '#ccc' : '#5A827E',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: loadingSubmit ? 'not-allowed' : 'pointer',
              opacity: loadingSubmit ? 0.6 : 1,
            }}
          >
            {loadingSubmit ? 'Loading...' : 'Submit'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
