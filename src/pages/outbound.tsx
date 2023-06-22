import type { Item } from "@prisma/client";
import {
  useReactTable,
  type ColumnDef,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useStyletron } from "baseui";
import { Block } from "baseui/block";
import { Button, KIND } from "baseui/button";
import { Checkbox } from "baseui/checkbox";
import { ChangeEventHandler, Children, useEffect, useState } from "react";
import { api } from "~/utils/api";
import {
  StyledRoot,
  StyledTable,
  StyledTableHeadRow,
  StyledTableHeadCell,
  StyledTableBodyRow,
  StyledTableBodyCell,
} from "baseui/table-semantic";
import { FormControl } from "baseui/form-control";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalButton,
  SIZE,
  ROLE,
} from "baseui/modal";
import { Input } from "baseui/input";
import Head from "next/head";
import { useRouter } from "next/router";

const columns: ColumnDef<Item>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        isIndeterminate={table.getIsSomeRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        isIndeterminate={row.getIsSomeSelected()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
  },
  {
    accessorKey: "name",
    cell: (info) => info.getValue(),
    header: "이름",
  },
  {
    accessorKey: "quantity",
    cell: (info) => info.getValue(),
    header: "수량",
  },
  {
    accessorKey: "price",
    cell: (info) => info.getValue(),
    header: "가격",
  },
];

const emptyArray: Item[] = [];
const initialInputs = {
  itemName: "",
  maxQuantity: "" as const,
  maxPrice: "" as const,
};

const Outbound = () => {
  const [inputs, setInputs] = useState<{
    itemName?: string;
    maxPrice?: number | "";
    maxQuantity?: number | "";
  }>(initialInputs);
  const [inputsError, setInputsError] = useState<{
    itemName: string;
    maxQuantity: string;
    maxPrice: string;
  }>({ itemName: "", maxQuantity: "", maxPrice: "" });
  const [queryInput, setQueryInput] = useState<{
    itemName?: string;
    maxPrice?: number;
    maxQuantity?: number;
  }>();

  const [rowSelection, setRowSelection] = useState({});

  const [isOpen, setIsOpen] = useState(false);

  const items = api.item.findAll.useQuery(queryInput ?? {}, {
    trpc: { abortOnUnmount: true },
    enabled: Boolean(queryInput),
  });
  const item = api.item.ship.useMutation({
    onSuccess() {
      alert("출고되었습니다.");
    },
  });

  const table = useReactTable({
    data: items.data ?? emptyArray,
    columns,
    state: { rowSelection },
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    debugTable: true,
  });

  const [css] = useStyletron();

  const { query } = useRouter();

  useEffect(() => {
    return () => {
      if (!items.isLoading) {
        items.remove();
      }
    };
  }, []);

  const openModal = () => {
    setIsOpen(Object.keys(rowSelection).length !== 0);
  };
  const closeModal = ({ ship = false } = {}) => {
    setIsOpen(false);
    const indexes = Object.keys(rowSelection);
    console.log(
      ` -----------------------------------------------------------------------------------------------------------------------------`
    );
    console.log(
      `file: outbound.tsx:139 | closeModal | ship && items.data && indexes.length !== 0:`,
      ship,
      items.data?.length === 0,
      indexes.length !== 0
    );
    console.log(
      ` -----------------------------------------------------------------------------------------------------------------------------`
    );
    if (ship && indexes.length !== 0) {
      const itemIds = new Set<string>().add(
        typeof query.itemId === "string" ? query.itemId : ""
      );

      for (let index = 0; index < (items.data?.length ?? 0); index++) {
        if (indexes.includes(String(index))) {
          itemIds.add(items.data?.[index]?.id ?? "");
        }
      }

      if (itemIds.size > 0) {
        void item
          .mutateAsync({
            itemIds: [...itemIds],
          })
          .then(() => {
            setQueryInput((prevQueryInput) => ({
              ...prevQueryInput,
              ...(typeof inputs.itemName === "string" &&
                inputs.itemName !== "" && { itemName: inputs.itemName }),
              ...(inputs.maxQuantity !== "" &&
                Number.isFinite(Number(inputs.maxQuantity)) && {
                  maxQuantity: Number(inputs.maxQuantity),
                }),
              ...(inputs.maxPrice !== "" &&
                Number.isFinite(Number(inputs.maxPrice)) && {
                  maxPrice: Number(inputs.maxPrice),
                }),
            }));
          });
      }
    }
  };

  const getInputsErrorMessages = ({ name = "", value = "" } = {}) => ({
    maxQuantityError:
      ((name === "maxQuantity" && value) || inputs.maxQuantity) !== "" &&
      Number.isInteger(
        Number((name === "maxQuantity" && value) || inputs.maxQuantity)
      ) &&
      Number((name === "maxQuantity" && value) || inputs.maxQuantity) < 1
        ? "상품 수량은 0보다 커야 합니다."
        : "",
    maxPriceError:
      ((name === "maxPrice" && value) || inputs.maxPrice) !== "" &&
      Number.isFinite(
        Number((name === "maxPrice" && value) || inputs.maxPrice)
      ) &&
      Number((name === "maxPrice" && value) || inputs.maxPrice) < 0
        ? "단일 상품 가격은 음수일 수 없습니다."
        : "",
  });

  const setMaxQuantityErrorMessage = ({ name = "", value = "" } = {}) => {
    const { maxQuantityError } = getInputsErrorMessages({ name, value });
    setInputsError((prevInputError) => ({
      ...prevInputError,
      maxQuantity: maxQuantityError,
    }));
  };

  const setMaxPriceErrorMessage = ({ name = "", value = "" } = {}) => {
    const { maxPriceError } = getInputsErrorMessages({ name, value });
    setInputsError((prevInputError) => ({
      ...prevInputError,
      maxPrice: maxPriceError,
    }));
  };

  const onBlurMaxQuantity = () => {
    setMaxQuantityErrorMessage();
  };
  const onBlurMaxPrice = () => {
    setMaxPriceErrorMessage();
  };

  const onChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (
    e
  ) => {
    const { value, name } = e.target;
    setInputs((prevInputs) => ({
      ...prevInputs,
      [name]: value,
    }));
    switch (name) {
      case "maxQuantity":
        setMaxQuantityErrorMessage({ name, value });
        break;
      case "maxPrice":
        setMaxPriceErrorMessage({ name, value });
        break;
      default:
        break;
    }
  };

  const onSearch = async () => {
    const { maxQuantityError, maxPriceError } = getInputsErrorMessages();

    if (!maxQuantityError && !maxPriceError) {
      setQueryInput((prevQueryInput) => ({
        ...prevQueryInput,
        ...(typeof inputs.itemName === "string" &&
          inputs.itemName !== "" && { itemName: inputs.itemName }),
        ...(inputs.maxQuantity !== "" &&
          Number.isFinite(Number(inputs.maxQuantity)) && {
            maxQuantity: Number(inputs.maxQuantity),
          }),
        ...(inputs.maxPrice !== "" &&
          Number.isFinite(Number(inputs.maxPrice)) && {
            maxPrice: Number(inputs.maxPrice),
          }),
      }));
    }
  };

  const onReset = () => {
    setInputs(initialInputs);
    setQueryInput(undefined);
    table.resetRowSelection();
    items.remove();
  };

  return (
    <>
      <Head>
        <title>출고</title>
        <meta name="description" content="출고 메뉴" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Block width={"40em"} margin={"0 auto"}>
        <Block
          display={"flex"}
          justifyContent={"flex-end"}
          marginBottom={"1em"}
          className={css({ gap: "1em" })}
        >
          <Button type="button" onClick={() => void onSearch()}>
            검색
          </Button>
          <Button
            type="button"
            kind={KIND.secondary}
            onClick={() => void openModal()}
            disabled={Object.keys(rowSelection).length === 0}
          >
            출고
          </Button>
          <Button
            type="button"
            kind={KIND.tertiary}
            onClick={() => void onReset()}
          >
            초기화
          </Button>
        </Block>
        <Block marginBottom={"3em"}>
          <FormControl
            label={() => "상품 이름"}
            caption={() => inputsError.itemName}
          >
            <Input
              placeholder={"e.g. 광택용 천"}
              clearable
              error={Boolean(inputsError.itemName)}
              type="text"
              name="itemName"
              value={inputs.itemName}
              onChange={onChange}
            />
          </FormControl>
          <FormControl
            label={() => "상품 수량"}
            caption={() => inputsError.maxQuantity}
          >
            <Input
              placeholder={"e.g. 1000"}
              clearable
              error={Boolean(inputsError.maxQuantity)}
              type="number"
              min={1}
              name="maxQuantity"
              onBlur={onBlurMaxQuantity}
              value={inputs.maxQuantity}
              onChange={onChange}
            />
          </FormControl>
          <FormControl
            label={() => "단일 상품 가격"}
            caption={() => inputsError.maxPrice}
          >
            <Input
              placeholder={"e.g. 28000"}
              clearable
              error={Boolean(inputsError.maxPrice)}
              type="number"
              min={1}
              name="maxPrice"
              onBlur={onBlurMaxPrice}
              value={inputs.maxPrice}
              onChange={onChange}
            />
          </FormControl>
        </Block>
        <StyledRoot>
          <StyledTable>
            <thead>
              {Children.toArray(
                table
                  .getHeaderGroups()
                  .map((headerGroup) => (
                    <StyledTableHeadRow>
                      {Children.toArray(
                        headerGroup.headers.map((header) => (
                          <StyledTableHeadCell colSpan={header.colSpan}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </StyledTableHeadCell>
                        ))
                      )}
                    </StyledTableHeadRow>
                  ))
              )}
            </thead>
            <tbody>
              {Children.toArray(
                table.getRowModel().rows.map((row) => (
                  <StyledTableBodyRow
                    onDoubleClick={() => void console.table(row.original)}
                  >
                    {Children.toArray(
                      row.getVisibleCells().map((cell) => {
                        if (
                          !row.getIsSelected() &&
                          row.getCanSelect() &&
                          row.original.id === query.itemId
                        ) {
                          row.toggleSelected();
                        }
                        return (
                          <StyledTableBodyCell
                            $isNumeric={
                              cell.getValue() !== "" &&
                              Number.isFinite(Number(cell.getValue()))
                            }
                          >
                            {cell.getIsAggregated() ||
                            typeof cell.getValue() !== "bigint" ? (
                              flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )
                            ) : (
                              <>{cell.getValue()?.toString()}</>
                            )}
                          </StyledTableBodyCell>
                        );
                      })
                    )}
                  </StyledTableBodyRow>
                ))
              )}
            </tbody>
          </StyledTable>
        </StyledRoot>
      </Block>
      {isOpen && (
        <Modal onClose={() => void closeModal()} isOpen={isOpen}>
          <ModalHeader>출고하시겠습니까?</ModalHeader>
          <ModalBody>
            출고하게 되면 수량이 1씩 줄어들게 됩니다. 수량이 1 이하일 경우 검색
            결과에서 삭제될 수 있습니다. 출고하고 싶다면 우측 하단의 '출고'
            버튼을 클릭하시고, 그렇지 않을 경우 '출고' 버튼 좌측의 '취소' 버튼을
            클릭하세요.
          </ModalBody>
          <ModalFooter>
            <ModalButton kind="tertiary" onClick={closeModal}>
              취소
            </ModalButton>
            <ModalButton onClick={() => void closeModal({ ship: true })}>
              출고
            </ModalButton>
          </ModalFooter>
        </Modal>
      )}
    </>
  );
};

export default Outbound;
