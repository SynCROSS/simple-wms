import { ChangeEventHandler, Children, useEffect, useState } from "react";
import { api } from "~/utils/api";
import {
  getCoreRowModel,
  useReactTable,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import type { Item } from "@prisma/client";
import { Button, KIND } from "baseui/button";
import { useStyletron } from "baseui";
import { Block } from "baseui/block";
import {
  StyledRoot,
  StyledTable,
  StyledTableHeadRow,
  StyledTableHeadCell,
  StyledTableBodyRow,
  StyledTableBodyCell,
} from "baseui/table-semantic";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalButton,
  SIZE,
  ROLE,
} from "baseui/modal";
import { FormControl } from "baseui/form-control";
import { Input } from "baseui/input";
import Head from "next/head";
import { Textarea } from "baseui/textarea";
import { useRouter } from "next/router";

const columns: ColumnDef<Item>[] = [
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

const Items = () => {
  const [inputs, setInputs] = useState<{
    itemName?: string;
    maxQuantity?: number | "";
    maxPrice?: number | "";
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

  const [item, setItem] = useState<Item>();

  const [isOpen, setIsOpen] = useState(false);

  const items = api.item.findAll.useQuery(queryInput ?? {}, {
    trpc: { abortOnUnmount: true },
    enabled: Boolean(queryInput),
  });

  const table = useReactTable({
    data: items.data ?? emptyArray,
    columns,
    getCoreRowModel: getCoreRowModel(),
    debugTable: true,
  });

  const [css] = useStyletron();
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (!items.isLoading) {
        items.remove();
      }
    };
  }, []);

  const openModal = (item: Item) => {
    setIsOpen(true);
    setItem(item);
  };
  const closeModal = ({ ship = false } = {}) => {
    setIsOpen(false);
    if (ship && item?.id) {
      router.push(`/outbound?${new URLSearchParams({ itemId: item.id })}`);
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
    items.remove();
  };

  return (
    <>
      <Head>
        <title>재고</title>
        <meta name="description" content="재고 메뉴" />
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
                table
                  .getRowModel()
                  .rows.map((row) => (
                    <StyledTableBodyRow
                      onDoubleClick={() => void openModal(row.original)}
                    >
                      {Children.toArray(
                        row
                          .getVisibleCells()
                          .map((cell) => (
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
                          ))
                      )}
                    </StyledTableBodyRow>
                  ))
              )}
            </tbody>
          </StyledTable>
        </StyledRoot>
      </Block>
      {isOpen && item && (
        <Modal onClose={() => void closeModal()} isOpen={isOpen}>
          <ModalHeader>상품 상세 정보</ModalHeader>
          <ModalBody>
            <Block marginBottom={"3em"}>
              <FormControl label={() => "상품 이름"}>
                <Input
                  placeholder={"e.g. 광택용 천"}
                  type="text"
                  name="name"
                  value={item.name}
                  readOnly
                />
              </FormControl>
              <FormControl label={() => "상품 설명"}>
                <Textarea
                  placeholder={
                    "e.g. 마모를 일으키지 않는 부드러운 소재로 만들어진 광택용 천은 Nano-texture 글래스를 포함해 모든 Apple 디스플레이를 안전하고 깨끗하게 닦아줍니다."
                  }
                  type="text"
                  name="description"
                  value={item.description ?? ""}
                  readOnly
                />
              </FormControl>
              <FormControl label={() => "상품 수량"}>
                <Input
                  placeholder={"e.g. 1000"}
                  type="number"
                  min={1}
                  name="quantity"
                  value={Number(item.quantity)}
                  readOnly
                />
              </FormControl>
              <FormControl label={() => "단일 상품 가격"}>
                <Input
                  placeholder={"e.g. 28000"}
                  type="number"
                  min={1}
                  name="price"
                  value={Number(item.price)}
                  readOnly
                />
              </FormControl>
              <FormControl label={() => "비고"}>
                <Textarea
                  placeholder={
                    "e.g. 광택용 천은 Apple 특유의 네이밍 컨벤션을 따르지 않습니다?!"
                  }
                  type="text"
                  name="remark"
                  value={item.remark ?? ""}
                  readOnly
                />
              </FormControl>
            </Block>
          </ModalBody>
          <ModalFooter>
            <ModalButton kind={KIND.tertiary} onClick={closeModal}>
              닫기
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

export default Items;
