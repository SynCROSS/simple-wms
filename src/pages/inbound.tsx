import { useStyletron } from "baseui";
import { Block } from "baseui/block";
import { Button, KIND } from "baseui/button";
import { FormControl } from "baseui/form-control";
import { Input } from "baseui/input";
import { Textarea } from "baseui/textarea";
import Head from "next/head";
import { ChangeEventHandler, useState } from "react";
import { api } from "~/utils/api";

const initialInputs = {
  name: "",
  description: "",
  quantity: "" as const,
  price: "" as const,
  remark: "",
};

const inbound = () => {
  const [inputs, setInputs] = useState<{
    name: string;
    description?: string;
    quantity: number | "";
    price: number | "";
    remark?: string;
  }>(initialInputs);
  const [inputsError, setInputsError] = useState<{
    name: string;
    quantity: string;
    price: string;
  }>({ name: "", quantity: "", price: "" });

  const item = api.item.save.useMutation({
    onSuccess() {
      alert("등록되었습니다.");
    },
  });
  const [css] = useStyletron();

  const getInputsErrorMessages = ({ name = "", value = "" } = {}) => ({
    nameBlankError: !((name === "name" && value) || inputs.name).trim()
      ? "상품 이름은 필수입니다."
      : "",
    quantityBlankError:
      ((name === "quantity" && value) || inputs.quantity) === "" ||
      !Number.isInteger(
        Number((name === "quantity" && value) || inputs.quantity)
      )
        ? "상품 수량은 필수입니다."
        : "",
    priceBlankError:
      ((name === "price" && value) || inputs.price) === "" ||
      !Number.isFinite(Number((name === "price" && value) || inputs.price))
        ? "단일 상품 가격은 필수입니다."
        : "",
    maxQuantityError:
      ((name === "quantity" && value) || inputs.quantity) !== "" &&
      Number.isInteger(
        Number((name === "quantity" && value) || inputs.quantity)
      ) &&
      Number((name === "quantity" && value) || inputs.quantity) < 1
        ? "상품 수량은 0보다 커야 합니다."
        : "",
    maxPriceError:
      ((name === "price" && value) || inputs.price) !== "" &&
      Number.isFinite(Number((name === "price" && value) || inputs.price)) &&
      Number((name === "price" && value) || inputs.price) < 1
        ? "단일 상품 가격은 0보다 커야 합니다."
        : "",
  });

  const onChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (
    e
  ) => {
    const { value, name } = e.target;
    setInputs((prevInputs) => ({
      ...prevInputs,
      [name]: value,
    }));
    switch (name) {
      case "name":
        setNameErrorMessage({ name, value });
        break;
      case "quantity":
        setQuantityErrorMessage({ name, value });
        break;
      case "price":
        setPriceErrorMessage({ name, value });
        break;
      default:
        break;
    }
  };

  const setNameErrorMessage = ({ name = "", value = "" } = {}) => {
    const { nameBlankError } = getInputsErrorMessages({ name, value });

    setInputsError((prevInputError) => ({
      ...prevInputError,
      name: nameBlankError,
    }));
  };
  const setQuantityErrorMessage = ({ name = "", value = "" } = {}) => {
    const { quantityBlankError, maxQuantityError } = getInputsErrorMessages({
      name,
      value,
    });

    setInputsError((prevInputError) => ({
      ...prevInputError,
      quantity: quantityBlankError || maxQuantityError,
    }));
  };
  const setPriceErrorMessage = ({ name = "", value = "" } = {}) => {
    const { priceBlankError, maxPriceError } = getInputsErrorMessages({
      name,
      value,
    });

    setInputsError((prevInputError) => ({
      ...prevInputError,
      price: priceBlankError || maxPriceError,
    }));
  };

  const onBlurName = () => {
    setNameErrorMessage();
  };
  const onBlurQuantity = () => {
    setQuantityErrorMessage();
  };
  const onBlurPrice = () => {
    setPriceErrorMessage();
  };

  const isValidSearchCondition = () => {
    const {
      nameBlankError,
      quantityBlankError,
      priceBlankError,
      maxQuantityError,
      maxPriceError,
    } = getInputsErrorMessages();

    return !(
      nameBlankError ||
      quantityBlankError ||
      priceBlankError ||
      maxQuantityError ||
      maxPriceError
    );
  };

  const onSave = () => {
    if (isValidSearchCondition()) {
      void item.mutate({
        ...inputs,
        quantity: Number(inputs.quantity),
        price: Number(inputs.price),
      });
    } else {
      setNameErrorMessage();
      setQuantityErrorMessage();
      setPriceErrorMessage();
    }
  };
  const onReset = () => {
    setInputs(initialInputs);
  };

  return (
    <>
      <Head>
        <title>입고</title>
        <meta name="description" content="입고 메뉴" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Block width={"40em"} margin={"0 auto"}>
        <Block marginBottom={"3em"}>
          <FormControl
            label={() => "상품 이름 (필수)"}
            caption={() => inputsError.name}
          >
            <Input
              placeholder={"e.g. 광택용 천"}
              clearable
              error={Boolean(inputsError.name)}
              type="text"
              name="name"
              value={inputs.name}
              onChange={onChange}
              onBlur={onBlurName}
              required
            />
          </FormControl>
          <FormControl label={() => "상품 설명"}>
            <Textarea
              placeholder={
                "e.g. 마모를 일으키지 않는 부드러운 소재로 만들어진 광택용 천은 Nano-texture 글래스를 포함해 모든 Apple 디스플레이를 안전하고 깨끗하게 닦아줍니다."
              }
              clearable
              type="text"
              name="description"
              value={inputs.description}
              onChange={onChange}
            />
          </FormControl>
          <FormControl
            label={() => "상품 수량 (필수)"}
            caption={() => inputsError.quantity}
          >
            <Input
              placeholder={"e.g. 1000"}
              clearable
              error={Boolean(inputsError.quantity)}
              type="number"
              min={1}
              name="quantity"
              value={inputs.quantity}
              onChange={onChange}
              onBlur={onBlurQuantity}
              required
            />
          </FormControl>
          <FormControl
            label={() => "단일 상품 가격 (필수)"}
            caption={() => inputsError.price}
          >
            <Input
              placeholder={"e.g. 28000"}
              clearable
              error={Boolean(inputsError.price)}
              type="number"
              min={1}
              name="price"
              value={inputs.price}
              onChange={onChange}
              onBlur={onBlurPrice}
              required
            />
          </FormControl>
          <FormControl label={() => "비고"}>
            <Textarea
              placeholder={
                "e.g. 광택용 천은 Apple 특유의 네이밍 컨벤션을 따르지 않습니다?!"
              }
              clearable
              type="text"
              name="remark"
              value={inputs.remark}
              onChange={onChange}
            />
          </FormControl>
        </Block>
        <Block
          display={"flex"}
          justifyContent={"flex-end"}
          marginBottom={"1em"}
          className={css({ gap: "1em" })}
        >
          <Button type="button" onClick={() => void onSave()}>
            등록
          </Button>
          <Button
            type="button"
            kind={KIND.secondary}
            onClick={() => void onReset()}
          >
            초기화
          </Button>
        </Block>
      </Block>
    </>
  );
};

export default inbound;
