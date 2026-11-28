import { type AppRadiusTheme, useSafeAppTheme } from "@hackert-ui/core";
import { cn } from "@hackert-ui/utils";
import {
  type ComponentPropsWithoutRef,
  createContext,
  type CSSProperties,
  type ReactNode,
  use,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { CloseButton, type CloseButtonProps } from "../CloseButton";
import { MODAL_CSS } from "./modal-styles";
import { ModalStack, useStackHidden } from "./ModalStack";
import { lockScroll } from "./scroll-lock";

export type ModalSize = "xs" | "sm" | "md" | "lg" | "xl" | "auto" | number | (string & {});

const WIDTH_PX: Readonly<Record<string, number>> = { xs: 320, sm: 380, md: 440, lg: 620, xl: 780 };

// Content stays mounted this long after closing, so the exit transition has something to show.
const EXIT_MS = 200;

interface ModalContextValue {
  readonly titleId: string;
  readonly descriptionId: string;
  readonly onClose: () => void;
  readonly setLabelled: (labelled: boolean) => void;
  readonly setDescribed: (described: boolean) => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

function useModalContext(part: string): ModalContextValue {
  const context = use(ModalContext);
  if (!context) throw new Error(`Modal.${part} must be rendered inside <Modal.Root> or <Modal>`);
  return context;
}

function widthOf(size: ModalSize): string | undefined {
  if (typeof size === "number") return `${size}px`;
  if (size === "auto") return undefined;
  const preset = WIDTH_PX[size];
  return preset === undefined ? size : `${preset}px`;
}

export interface ModalRootProps extends Omit<
  ComponentPropsWithoutRef<"dialog">,
  "open" | "onClose" | "onCancel"
> {
  readonly opened: boolean;
  readonly onClose: () => void;
  // A preset, "auto" to fit the content, a CSS width such as "70%", or pixels.
  readonly size?: ModalSize | undefined;
  readonly radius?: keyof AppRadiusTheme | undefined;
  // Centre vertically; by default the modal sits a little below the top of the viewport.
  readonly centered?: boolean | undefined;
  readonly closeOnEscape?: boolean | undefined;
  readonly closeOnClickOutside?: boolean | undefined;
  // Set by useModalsStack's register(); groups the modal with others in <Modal.Stack>.
  readonly stackId?: string | undefined;
}

function ModalRoot({
  opened,
  onClose,
  size = "lg",
  radius = "lg",
  centered = false,
  closeOnEscape = true,
  closeOnClickOutside = true,
  stackId,
  className,
  style,
  children,
  ...dialogProps
}: ModalRootProps) {
  const theme = useSafeAppTheme();
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [rendered, setRendered] = useState(opened);
  const [labelled, setLabelled] = useState(false);
  const [described, setDescribed] = useState(false);
  const stackHidden = useStackHidden(stackId, opened);
  const pressedBackdrop = useRef(false);

  if (opened && !rendered) setRendered(true);

  // Read by the native event handlers. Updated before the open/close effect below
  // runs, so a close event fired by that effect sees the new value.
  const latest = useRef({ opened, onClose, closeOnEscape });
  useEffect(() => {
    latest.current = { opened, onClose, closeOnEscape };
  });
  // Bumped when the browser closes the dialog while still opened, to re-run the open effect.
  const [forcedClose, setForcedClose] = useState(0);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (opened) {
      if (!dialog.open) dialog.showModal();
      return lockScroll();
    }
    if (dialog.open) dialog.close();
    const timer = setTimeout(() => setRendered(false), EXIT_MS);
    return () => clearTimeout(timer);
  }, [opened, forcedClose]);

  const context = useMemo(
    () => ({
      titleId: `${id}-title`,
      descriptionId: `${id}-description`,
      onClose,
      setLabelled,
      setDescribed,
    }),
    [id, onClose],
  );

  const width = widthOf(size);
  const vars = {
    ...(width === undefined ? {} : { "--hui-modal-width": width }),
    "--hui-radius": theme.radius[radius],
    "--hui-font": theme.fontFamily,
  } as CSSProperties;

  return (
    <>
      <style href="hui-modal" precedence="default">
        {MODAL_CSS}
      </style>
      <dialog
        ref={ref}
        aria-labelledby={labelled ? context.titleId : undefined}
        aria-describedby={described ? context.descriptionId : undefined}
        {...dialogProps}
        className={cn("hui-modal", className)}
        style={{ ...vars, ...style }}
        data-size={size === "auto" ? "auto" : undefined}
        data-centered={centered ? "" : undefined}
        data-stack-hidden={stackHidden ? "" : undefined}
        // Escape asks the owner to close rather than closing the dialog behind React's back.
        onCancel={(event) => {
          event.preventDefault();
          if (closeOnEscape) onClose();
        }}
        // The browser can still force a close (repeated Escape). Tell the owner unless
        // Escape is disabled, then reopen if they keep it opened.
        onClose={() => {
          if (!latest.current.opened) return;
          if (latest.current.closeOnEscape) latest.current.onClose();
          setForcedClose((count) => count + 1);
        }}
        // A click whose press and release both land on the dialog itself is on the
        // backdrop: the content fills the dialog, so nothing inside targets it.
        onPointerDown={(event) => {
          pressedBackdrop.current = event.target === event.currentTarget;
        }}
        onClick={(event) => {
          const onBackdrop = pressedBackdrop.current && event.target === event.currentTarget;
          pressedBackdrop.current = false;
          if (onBackdrop && closeOnClickOutside) onClose();
        }}
      >
        <ModalContext value={context}>{rendered ? children : null}</ModalContext>
      </dialog>
    </>
  );
}

export type ModalHeaderProps = ComponentPropsWithoutRef<"header">;

function ModalHeader({ className, ...props }: ModalHeaderProps) {
  useModalContext("Header");
  return <header {...props} className={cn("hui-modal-header", className)} />;
}

export type ModalTitleProps = Omit<ComponentPropsWithoutRef<"h2">, "id">;

function ModalTitle({ className, ...props }: ModalTitleProps) {
  const { titleId, setLabelled } = useModalContext("Title");
  useEffect(() => {
    setLabelled(true);
    return () => setLabelled(false);
  }, [setLabelled]);

  return <h2 {...props} id={titleId} className={cn("hui-modal-title", className)} />;
}

export type ModalDescriptionProps = Omit<ComponentPropsWithoutRef<"p">, "id">;

function ModalDescription({ className, ...props }: ModalDescriptionProps) {
  const { descriptionId, setDescribed } = useModalContext("Description");
  useEffect(() => {
    setDescribed(true);
    return () => setDescribed(false);
  }, [setDescribed]);

  return <p {...props} id={descriptionId} className={cn("hui-modal-description", className)} />;
}

function ModalCloseButton({ onClick, ...props }: CloseButtonProps) {
  const { onClose } = useModalContext("CloseButton");
  return (
    <CloseButton
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) onClose();
      }}
    />
  );
}

export type ModalBodyProps = ComponentPropsWithoutRef<"div">;

function ModalBody({ className, ...props }: ModalBodyProps) {
  useModalContext("Body");
  return <div {...props} className={cn("hui-modal-body", className)} />;
}

export interface ModalProps extends Omit<ModalRootProps, "title"> {
  readonly title?: ReactNode;
  readonly description?: ReactNode;
  // false removes the close button; with no title or description, the header goes too.
  readonly withCloseButton?: boolean | undefined;
  readonly closeButtonProps?: CloseButtonProps | undefined;
}

function hasContent(node: ReactNode): boolean {
  return node !== undefined && node !== null && node !== false;
}

function ModalComponent({
  title,
  description,
  withCloseButton = true,
  closeButtonProps,
  children,
  ...rootProps
}: ModalProps) {
  const hasHeading = hasContent(title) || hasContent(description);

  return (
    <ModalRoot {...rootProps}>
      {hasHeading || withCloseButton ? (
        <ModalHeader>
          {hasHeading ? (
            <div className="hui-modal-heading">
              {hasContent(title) ? <ModalTitle>{title}</ModalTitle> : null}
              {hasContent(description) ? <ModalDescription>{description}</ModalDescription> : null}
            </div>
          ) : null}
          {withCloseButton ? <ModalCloseButton {...closeButtonProps} /> : null}
        </ModalHeader>
      ) : null}
      <ModalBody>{children}</ModalBody>
    </ModalRoot>
  );
}

export const Modal = Object.assign(ModalComponent, {
  Root: ModalRoot,
  Header: ModalHeader,
  Title: ModalTitle,
  Description: ModalDescription,
  CloseButton: ModalCloseButton,
  Body: ModalBody,
  Stack: ModalStack,
});
