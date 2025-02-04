import { useGetFleetsRecaps, useGetRecaps } from "../api/useLedgers";

interface IFleet {
  color: string | null;
  id: number;
  name: string;
  commission?: {
    owner?: number;
    partner?: number;
    transgo?: number;
  };
}

export interface IItems {
  id: number | string;
  status: string;
  update_at: string;
  category: { name: string };
  created_at: string;
  date: string;
  end_date: string;
  duration: number;
  credit_amount: number | null;
  debit_amount: number | null;
  commission: number;
  description: string | null;
  owner_commission?: number;
  fleet: IFleet;
  user: { name: string };
  order?: { discount?: number };
}

export interface ITotal {
  debit: 0;
  credit: 0;
  duration: 0;
  owner_comission: 0;
}

const useRecapsStore = (params?: any, get_fleets: boolean = false) => {
  const { data: recaps, isFetching } = !get_fleets ? useGetRecaps(params) : useGetFleetsRecaps(params);

  const items: IItems[] =
    recaps?.data?.items.map((item: IItems) => ({
      ...item,
    })) || [];

  const total: ITotal = recaps?.data?.total
    ? {
      ...recaps?.data?.total,
    }
    : { debit: 0, credit: 0, duration: 0, owner_commission: 0 };

  if (!isFetching && items.length < 5) {
    const emptyDataCount = 5;
    for (let i = 0; i < emptyDataCount; i++) {
      items.push({
        id: "",
        status: "",
        update_at: "",
        created_at: "",
        category: { name: "" },
        date: "",
        end_date: "",
        duration: 0,
        credit_amount: null,
        debit_amount: null,
        user: { name: "" },
        commission: 0,
        description: "",
        fleet: {
          color: "",
          id: 0,
          name: "",
        },
      });
    }
  }

  return {
    items,
    total,
    isFetching,
  };
};

export default useRecapsStore;
